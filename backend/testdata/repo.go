package testdata

import "github.com/lesterfernandez/course-scheduler/backend/model"

type UserTestRepo struct {
	UserCreateMock       func(user *model.User) error
	UserExistsMock       func(username string) bool
	UserByUsernameMock   func(username string) (*model.User, error)
	UserIdByUsernameMock func(username string) (uint, error)
}

func (u *UserTestRepo) UserCreate(user *model.User) error {
	return u.UserCreateMock(user)
}

func (u *UserTestRepo) UserExists(username string) bool {
	return u.UserExistsMock(username)
}

func (u *UserTestRepo) UserByUsername(username string) (*model.User, error) {
	return u.UserByUsernameMock(username)
}

func (u *UserTestRepo) UserIdByUsername(username string) (uint, error) {
	return u.UserIdByUsernameMock(username)
}

type CourseTestRepo struct {
	CoursesByUserIdMock   func(userId uint) []*model.Course
	CoursesByUsernameMock func(username string) []*model.Course
	CoursesCreateMock     func(courses []*model.Course, userId uint) error
}

func (c *CourseTestRepo) Courses(userId uint) []*model.Course {
	return c.CoursesByUserIdMock(userId)
}

func (c *CourseTestRepo) CoursesByUsername(username string) []*model.Course {
	return c.CoursesByUsernameMock(username)
}

func (c *CourseTestRepo) CoursesCreate(courses []*model.Course, userId uint) error {
	return c.CoursesCreateMock(courses, userId)
}

func (c *CourseTestRepo) CoursesByUserId(userId uint) []*model.Course {
	return c.CoursesByUserIdMock(userId)
}
