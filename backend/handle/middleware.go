package handle

import (
	"context"
	"net/http"

	"github.com/vivekup3424/course-scheduler/backend/auth"
)

type TokenKey string

var AuthToken TokenKey = "authorization"

func JwtFilter(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, parseJwtErr := auth.ParseTokenFromRequest(r)

		if parseJwtErr != nil {
			respondWithError(w, "Not logged in!", http.StatusUnauthorized)
			return
		}

		c := context.WithValue(r.Context(), AuthToken, token)

		h(w, r.WithContext(c))
	}
}
