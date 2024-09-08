package handle

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/vivekup3424/course-scheduler/backend/auth"
	"github.com/vivekup3424/course-scheduler/backend/model"
	"github.com/vivekup3424/course-scheduler/backend/testdata"
	"golang.org/x/crypto/bcrypt"
)

func TestRegister(t *testing.T) {
	t.Run("New user is created", func(t *testing.T) {
		userRepo := &testdata.UserTestRepo{
			UserCreateMock: func(user *model.User) error { return nil },
			UserByUsernameMock: func(username string) (*model.User, error) {
				u := testdata.CreateTestUser()
				u.Username = username
				return u, nil
			},
			UserExistsMock: func(username string) bool { return false },
		}

		mux := http.NewServeMux()
		SetupHandlers(&Server{
			User: userRepo,
		}, mux)

		creds := userCreds{
			Username: "Bob",
			Password: "Password123",
		}
		reqBody, _ := json.Marshal(creds)
		req := httptest.NewRequest(http.MethodGet, RouteRegister, bytes.NewReader(reqBody))
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, req)

		res := w.Result()
		resBody, _ := io.ReadAll(res.Body)
		authRes := authResponse{}
		unmarshalErr := json.Unmarshal(resBody, &authRes)

		if unmarshalErr != nil {
			t.Fatal("Could not parse response:", unmarshalErr)
		}

		if authRes.Username != "Bob" || !authRes.LoggedIn {
			t.FailNow()
		}

		if w.Result().StatusCode != http.StatusCreated {
			t.Fatal("Incorrect status code")
		}

		passDigest, _ := bcrypt.GenerateFromPassword([]byte(creds.Password), 10)
		user := model.User{
			Username:     creds.Username,
			PasswordHash: string(passDigest),
		}
		token, _ := auth.CreateToken(&user)

		if token != authRes.Token {
			t.Fatal("Did not generate JWT correctly")
		}
	})

	t.Run("Register with existing username", func(t *testing.T) {
		userRepo := &testdata.UserTestRepo{
			UserCreateMock: func(user *model.User) error { return nil },
			UserByUsernameMock: func(username string) (*model.User, error) {
				u := testdata.CreateTestUser()
				u.Username = username
				return u, nil
			},
			UserExistsMock: func(username string) bool { return true },
		}
		mux := http.NewServeMux()
		SetupHandlers(&Server{
			User: userRepo,
		}, mux)

		reqBody, _ := json.Marshal(userCreds{
			Username: "Bob",
			Password: "Password123",
		})

		req := httptest.NewRequest(http.MethodGet, RouteRegister, bytes.NewReader(reqBody))
		w := httptest.NewRecorder()
		mux.ServeHTTP(w, req)

		res := w.Result()
		resBody, _ := io.ReadAll(res.Body)
		authRes := errorMsg{}
		unmarshalErr := json.Unmarshal(resBody, &authRes)

		if unmarshalErr != nil {
			t.Fatal("Could not parse response:", unmarshalErr)
		}

		if res.StatusCode != http.StatusConflict {
			t.Fatal("Incorrect status code")
		}
	})
}
