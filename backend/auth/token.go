package auth

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/vivekup3424/course-scheduler/backend/model"
)

const jwtSecret = "totally not a secret string here..."

func CreateToken(u *model.User) (string, error) {
	if u.Username == "" {
		return "", errors.New("invalid user format")
	}

	claims := &jwt.RegisteredClaims{
		Subject:   u.Username,
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 7)),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(jwtSecret))
}

func ParseToken(token string) (*jwt.Token, error) {
	validMethods := []string{jwt.SigningMethodHS256.Name}
	parser := jwt.NewParser(jwt.WithValidMethods(validMethods), jwt.WithIssuedAt())
	parsedToken, parseErr := parser.Parse(token, func(t *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})
	return parsedToken, parseErr
}

func ParseAuthHeader(r *http.Request) (string, error) {
	header := r.Header.Get("Authorization")
	splitHeader := strings.Split(header, " ")
	if len(splitHeader) != 2 || !strings.EqualFold(splitHeader[0], "Bearer") {
		return "", errors.New("invalid authorization header")
	}
	token := splitHeader[1]
	return token, nil
}

func ParseTokenFromRequest(r *http.Request) (*jwt.Token, error) {
	token, parseHeaderErr := ParseAuthHeader(r)

	if parseHeaderErr != nil {
		return nil, parseHeaderErr
	}

	jwt, parseTokenErr := ParseToken(token)

	if parseTokenErr != nil {
		return nil, parseTokenErr
	}

	return jwt, nil
}
