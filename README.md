# Course Scheduler

This project provides a seamless way for students to manage their courses, track their progress, and plan their educational journey efficiently. The app is designed with user-friendly features and secure authentication to ensure a smooth experience.

## Features

- **Authentication**: Users can register and log in with password authentication. JWTs are used for authorization and Bcrypt is used for password hashing.
- **Course Selection**: Students can easily add courses to their schedules, manage prerequisites, and submit their course choices through the TypeScript and React.js responsive frontend.
- **Smart Course Ordering**: The Go backend turns the user's schedule into a graph and runs a topological sort to find an adequate course ordering.
- **Schedule Persistence**: Completed courses, their ordering, and progress status are stored in a PostgreSQL database.
- **Real-Time Updates**: As students mark courses as completed, the underlying course availability graph updates dynamically, showing the next available courses.
- **Dark/Light Theme**

## Deployment

- **Frontend**: Static website is built with Vite and hosted on a Netlify CDN.
- **Backend**: The Go API is built and then deployed as a Docker container on a Digital Ocean Linux VPS. It's secured behind an NGINX reverse proxy with a Let's Encrypt TLS 1.3 certificate. GitHub Actions is used as the CI pipeline.
