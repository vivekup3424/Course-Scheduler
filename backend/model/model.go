package model

import "time"

type User struct {
	ID                     uint
	CreatedAt, UpdatedAt   time.Time
	Username, PasswordHash string
	Courses                []*Course
}

type Course struct {
	ID              uint
	Uuid            string `gorm:"unique"`
	Letters, Number string
	CourseIndex     uint
	// Status "AVAILABLE" | "COMPLETED" = "COMPLETED"
	Status        string
	UserID        uint
	Prerequisites []*Course `gorm:"many2many:course_prereqs"`
}
