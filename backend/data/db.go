package data

import (
	"log"
	"os"

	"github.com/lesterfernandez/course-scheduler/backend/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func SetupDb() *gorm.DB {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		log.Println("Using fallback DATABASE_URL")
		url = "postgresql://postgres:postgres@localhost:5001"
	}

	db, err := gorm.Open(postgres.Open(url),
		&gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	if err != nil {
		panic("Could not connect to db")
	}
	db.AutoMigrate(&model.User{}, &model.Course{})
	return db
}
