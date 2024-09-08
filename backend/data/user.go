package data

import (
	"github.com/lesterfernandez/course-scheduler/backend/model"
	"gorm.io/gorm"
)

type UserRepo interface {
	UserCreate(user *model.User) error
	UserExists(username string) bool
	UserByUsername(username string) (*model.User, error)
	UserIdByUsername(username string) (uint, error)
}

type UserData struct {
	Db *gorm.DB
}

func (data *UserData) UserCreate(user *model.User) error {
	return data.Db.Create(user).Error
}

func (data *UserData) UserExists(username string) bool {
	_, notFoundErr := data.UserByUsername(username)
	return notFoundErr == nil
}

func (data *UserData) UserByUsername(username string) (*model.User, error) {
	user := model.User{}
	notFoundErr := data.Db.First(&user, "username = ?", username).Error
	return &user, notFoundErr
}

func (data *UserData) UserIdByUsername(username string) (uint, error) {
	user := model.User{}
	notFoundErr := data.Db.Select("id").First(&user, "username = ?", username).Error
	return user.ID, notFoundErr
}
