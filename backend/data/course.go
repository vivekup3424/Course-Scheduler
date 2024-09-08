package data

import (
	"github.com/vivekup3424/course-scheduler/backend/model"
	"gorm.io/gorm"
)

type CourseRepo interface {
	CoursesByUserId(userId uint) []*model.Course
	CoursesByUsername(username string) []*model.Course
	CoursesCreate(courses []*model.Course, userId uint) error
}

type CourseData struct {
	Db *gorm.DB
}

func (data *CourseData) CoursesByUserId(userId uint) []*model.Course {
	var courses []*model.Course
	data.Db.Raw(`SELECT id, uuid, letters, number, course_index, status, user_id FROM courses c 
					WHERE c.user_id = ?`, userId).
		Scan(&courses)

	courseMap := make(map[uint]*model.Course)
	for _, course := range courses {
		courseMap[course.ID] = course
	}

	result := make([]struct {
		CourseId       uint
		PrerequisiteId uint
	}, 0)

	data.Db.Raw(`SELECT course_id, prerequisite_id FROM course_prereqs cp
					INNER JOIN courses c ON cp.course_id = c.id
					WHERE c.user_id = ?`, userId).Scan(&result)

	courseToPrereqs := make(map[uint][]uint)
	for _, row := range result {
		courseToPrereqs[row.CourseId] = append(courseToPrereqs[row.CourseId], row.PrerequisiteId)
	}

	for _, course := range courses {
		for _, prereq := range courseToPrereqs[course.ID] {
			course.Prerequisites = append(course.Prerequisites, courseMap[prereq])
		}
	}

	return courses
}

func (data *CourseData) CoursesByUsername(username string) []*model.Course {
	var courses []*model.Course
	data.Db.Raw(`SELECT uuid, letters, number, course_index, status, user_id FROM courses c
					WHERE c.user_id = (SELECT u.id FROM users u WHERE u.username = ?)`, username).
		Scan(&courses)

	courseMap := make(map[uint]*model.Course)
	for _, course := range courses {
		courseMap[course.ID] = course
	}

	result := make([]struct {
		CourseId       uint
		PrerequisiteId uint
	}, 0)

	data.Db.Raw(`SELECT course_id, prerequisite_id FROM course_prereqs cp
					INNER JOIN courses c ON cp.course_id = c.id
					WHERE c.user_id = (SELECT u.id FROM users u WHERE u.username = ?)`, username).
		Scan(&result)

	courseToPrereqs := make(map[uint][]uint)
	for _, row := range result {
		courseToPrereqs[row.CourseId] = append(courseToPrereqs[row.CourseId], row.PrerequisiteId)
	}

	for _, course := range courses {
		for _, prereq := range courseToPrereqs[course.ID] {
			course.Prerequisites = append(course.Prerequisites, courseMap[prereq])
		}
	}

	return courses
}

func (data *CourseData) CoursesCreate(courses []*model.Course, userId uint) error {
	for _, course := range courses {
		course.UserID = userId
	}

	data.Db.Transaction(func(tx *gorm.DB) error {
		data.Db.Exec(`DELETE FROM course_prereqs cp
						WHERE cp.course_id in (SELECT c.id FROM courses c WHERE c.user_id = ?)`,
			userId)
		data.Db.Exec("DELETE FROM courses c WHERE c.user_id = ?", userId)
		if len(courses) > 0 {
			data.Db.Create(&courses)
		}
		return nil
	})

	return nil
}
