package testdata

import (
	crand "crypto/rand"
	"encoding/hex"
	"fmt"
	"math/rand"
	"time"

	"github.com/lesterfernandez/course-scheduler/backend/model"
	"golang.org/x/crypto/bcrypt"
)

type TestUserOption func(*model.User)

func CreateTestUser(options ...TestUserOption) *model.User {
	bytes := make([]byte, 4)
	crand.Read(bytes)
	passDigest, _ := bcrypt.GenerateFromPassword(bytes, 10)

	u := &model.User{
		ID:           uint(rand.Intn(100)),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		Username:     "Bob",
		PasswordHash: string(passDigest),
	}

	for _, opt := range options {
		opt(u)
	}

	return u
}

func WithUsername(username string) func(*model.User) {
	return func(u *model.User) {
		u.Username = username
	}
}

func WithPassword(password string) func(*model.User) {
	return func(u *model.User) {
		passDigest, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
		u.PasswordHash = string(passDigest)
	}
}

func CreateTestCourse() *model.Course {
	bytes := make([]byte, 4)
	crand.Read(bytes)

	status := "AVAILABLE"
	if rand.Intn(2) == 1 {
		status = "COMPLETED"
	}

	return &model.Course{
		ID:          uint(rand.Intn(100)),
		Uuid:        hex.EncodeToString(bytes),
		Letters:     "COP",
		Number:      fmt.Sprint(rand.Intn(999)),
		Status:      status,
		CourseIndex: uint(rand.Intn(10)),
		UserID:      uint(rand.Intn(100)),
	}
}
