package handle

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/vivekup3424/course-scheduler/backend/model"
)

type schedule struct {
	Courses []*model.Course `json:"courses"`
}

func (s *Server) CoursesRoot(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		JwtFilter(s.CoursesGet)(w, r)
	} else if r.Method == http.MethodPost {
		JwtFilter(s.CoursesPost)(w, r)
	}
}

func (s *Server) CoursesGet(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(AuthToken).(*jwt.Token)
	if !ok {
		respondWithError(w, "Not logged in!", http.StatusUnauthorized)
		return
	}

	username, _ := token.Claims.GetSubject()

	courses := s.Course.CoursesByUsername(username)
	resBody := schedule{
		courses,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resBody)
}

type courseDto struct {
	Uuid          string   `json:"uuid"`
	Letters       string   `json:"letters"`
	Number        string   `json:"number"`
	CourseIndex   int      `json:"courseIndex"`
	Status        string   `json:"status"`
	Prerequisites []string `json:"prerequisites"`
}

type scheduleDto struct {
	Courses []*courseDto `json:"courses"`
}

func (s *scheduleDto) fromCourses(courses []*model.Course) {
	uuidToPrereqs := make(map[string][]string, len(courses))

	for _, course := range courses {
		for _, prereq := range course.Prerequisites {
			uuidToPrereqs[course.Uuid] = append(uuidToPrereqs[course.Uuid], prereq.Uuid)
		}
	}

	s.Courses = make([]*courseDto, 0, len(courses))
	for _, course := range courses {

		prereqs := uuidToPrereqs[course.Uuid]
		if prereqs == nil {
			prereqs = make([]string, 0)
		}

		course := courseDto{
			Uuid:          course.Uuid,
			Letters:       course.Letters,
			Number:        course.Number,
			CourseIndex:   int(course.CourseIndex),
			Status:        course.Status,
			Prerequisites: prereqs,
		}
		s.Courses = append(s.Courses, &course)
	}
}

func buildMaps(s *scheduleDto) map[string]*model.Course {
	courseMap := make(map[string]*model.Course, len(s.Courses))
	for _, courseDto := range s.Courses {
		course := model.Course{
			Uuid:        courseDto.Uuid,
			Letters:     courseDto.Letters,
			Number:      courseDto.Number,
			CourseIndex: uint(courseDto.CourseIndex),
			Status:      courseDto.Status,
		}
		courseMap[course.Uuid] = &course
	}

	for _, c := range s.Courses {
		course := courseMap[c.Uuid]
		for _, p := range c.Prerequisites {
			course.Prerequisites = append(course.Prerequisites, courseMap[p])
		}
	}
	return courseMap
}

func initializeGraph(s *scheduleDto, courseMap map[string]*model.Course) (map[*model.Course][]*model.Course, []*model.Course, map[*model.Course]int) {
	adjList := make(map[*model.Course][]*model.Course)
	inDegree := make(map[*model.Course]int)
	available := make([]*model.Course, 0)
	for _, courseDto := range s.Courses {
		course := courseMap[courseDto.Uuid]
		for _, prereqUuid := range courseDto.Prerequisites {
			prereq := courseMap[prereqUuid]
			adjList[prereq] = append(adjList[prereq], course)
			inDegree[course]++
		}
		if inDegree[course] == 0 {
			available = append(available, course)
		}
	}
	return adjList, available, inDegree
}

func sortCourses(adjList map[*model.Course][]*model.Course, available []*model.Course, inDegree map[*model.Course]int, dst []*model.Course) []*model.Course {
	for i := uint(0); len(available) > 0; i++ {
		current := available[0]
		current.CourseIndex = i
		available[0] = nil
		available = available[1:]
		dst = append(dst, current)
		for _, adj := range adjList[current] {
			inDegree[adj]--
			if inDegree[adj] == 0 {
				available = append(available, adj)
			}
		}
	}
	return dst
}

func (s *Server) CoursesPost(w http.ResponseWriter, r *http.Request) {
	token, ok := r.Context().Value(AuthToken).(*jwt.Token)
	if !ok {
		respondWithError(w, "Not logged in!", http.StatusUnauthorized)
		return
	}
	username, _ := token.Claims.GetSubject()

	submittedSchedule := scheduleDto{}
	parseBodyErr := json.NewDecoder(r.Body).Decode(&submittedSchedule)
	if parseBodyErr != nil {
		fmt.Println(parseBodyErr)
		respondWithError(w, "Something went wrong!", http.StatusBadRequest)
		return
	}

	courseMap := buildMaps(&submittedSchedule)

	adjList, available, inDegree := initializeGraph(&submittedSchedule, courseMap)

	sortedCourses := make([]*model.Course, 0, len(submittedSchedule.Courses))
	sortedCourses = sortCourses(adjList, available, inDegree, sortedCourses)
	if len(sortedCourses) != len(submittedSchedule.Courses) {
		respondWithError(w, "Prerequisite cycle detected!", http.StatusBadRequest)
		return
	}

	res := scheduleDto{}
	res.fromCourses(sortedCourses)

	userId, _ := s.User.UserIdByUsername(username)
	s.Course.CoursesCreate(sortedCourses, userId)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}
