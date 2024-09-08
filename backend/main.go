package main

import (
	"log"
	"net/http"
)

func main() {
	handler := setupServer()
	log.Panicln(http.ListenAndServe(":8080", handler))
}
