package handle

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/lesterfernandez/course-scheduler/backend/auth"
	"github.com/lesterfernandez/course-scheduler/backend/model"
	"golang.org/x/crypto/bcrypt"
)

func (s *Server) Register(w http.ResponseWriter, req *http.Request) {
	creds := userCreds{}
	decodeErr := json.NewDecoder(req.Body).Decode(&creds)

	if decodeErr != nil || creds.Username == "" || creds.Password == "" {
		respondWithError(w, "Invalid request!", http.StatusBadRequest)
		return
	}

	if s.User.UserExists(creds.Username) {
		respondWithError(w, "Username taken!", http.StatusConflict)
		return
	}

	passDigest, hashErr := bcrypt.GenerateFromPassword([]byte(creds.Password), 10)
	if hashErr != nil {
		respondWithError(w, "Something went wrong!", http.StatusInternalServerError)
		return
	}

	user := model.User{
		Username:     creds.Username,
		PasswordHash: string(passDigest),
	}

	s.User.UserCreate(&user)

	token, _ := auth.CreateToken(&user)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(authResponse{true, user.Username, token})
	fmt.Printf("Registered user: %v\n", creds)
}
