FROM golang:1.20-alpine AS setup
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .

FROM setup AS build
RUN go build -v -o /app/ main.go

FROM alpine AS built
COPY --from=0 /app/ /app/
CMD [ "/app/main" ]