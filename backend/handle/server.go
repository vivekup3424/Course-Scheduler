package handle

import (
	"net/http"

	"github.com/vivekup3424/course-scheduler/backend/data"
)

const (
	RouteRegister = "/api/auth/register"
	RouteLogin    = "/api/auth/login"
	RouteCourses  = "/api/schedule"
)

type Server struct {
	User   data.UserRepo
	Course data.CourseRepo
}

func SetupHandlers(s *Server, mux *http.ServeMux) {
	mux.HandleFunc(RouteRegister, s.Register)
	mux.HandleFunc(RouteLogin, s.LoginRoot)
	mux.HandleFunc(RouteCourses, s.CoursesRoot)
}
