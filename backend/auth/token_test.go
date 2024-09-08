package auth

import (
	"testing"
	"time"

	"github.com/vivekup3424/course-scheduler/backend/model"
	"golang.org/x/crypto/bcrypt"
)

func TestToken(t *testing.T) {
	passDigest, hashErr := bcrypt.GenerateFromPassword([]byte("password123"), 10)
	if hashErr != nil {
		t.Fatal("Could not create password hash")
	}

	user := model.User{
		ID:           1,
		CreatedAt:    time.Now().Add(-time.Hour * 24 * 7),
		UpdatedAt:    time.Now(),
		Username:     "Bob",
		PasswordHash: string(passDigest),
	}

	token, tokenErr := CreateToken(&user)
	if tokenErr != nil {
		t.Fatal("Could not create token", tokenErr)
	}

	parsedToken, parseErr := ParseToken(token)
	if parseErr != nil {
		t.Fatalf("Invalid token %v\n Error: %v\n", parsedToken, parseErr)
	}

	if username, err := parsedToken.Claims.GetSubject(); username != user.Username || err != nil {
		t.Fatalf("Invalid token %v\n Error: %v\n", parsedToken, parseErr)
	}
}
