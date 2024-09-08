package handle

type userCreds struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type authResponse struct {
	LoggedIn bool   `json:"loggedIn"`
	Username string `json:"username"`
	Token    string `json:"token"`
}

type loginResponse struct {
	authResponse
	Courses []*courseDto `json:"courses"`
}
