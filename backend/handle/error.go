package handle

import (
	"encoding/json"
	"net/http"
)

type errorMsg struct {
	ErrorMessage string `json:"errorMessage"`
}

func respondWithError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	internalErrMsg, _ := json.Marshal(errorMsg{msg})
	w.Write(internalErrMsg)
}
