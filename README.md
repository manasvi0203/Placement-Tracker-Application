# Placement Tracker

A full-stack MERN application designed to simplify campus placement management for colleges and universities. The platform provides a centralized dashboard for administrators to manage companies, students, job opportunities, and placement progress while allowing students to browse and apply for opportunities.

---

## Features

### Authentication & Authorization

* Secure JWT-based authentication
* Role-based access control (Admin & Student)
* Protected routes

### Admin Dashboard

* Manage student profiles
* Add, edit, and delete company details
* Post job opportunities
* Verify student accounts
* Monitor placement statistics
* Track application status
* Search and filter records

### Student Portal

* Register and login securely
* Complete and update profile
* Browse available companies and job openings
* Apply for jobs
* Track application progress
* View placement status

### Company Management

* Add new companies
* Store company details
* Manage job roles
* View eligible students

### Placement Analytics

* Dashboard with placement statistics
* Student application tracking
* Company-wise placement records

---

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* JWT Authentication
* REST APIs

### Database

* MongoDB
* Mongoose

### Other Tools

* Git & GitHub
* Postman
* VS Code

---

## Project Structure

```text
Placement-Tracker/
│
├── client/          # React Frontend
├── server/          # Express Backend
├── README.md
└── .gitignore
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>
```

### Install frontend dependencies

```bash
cd client
npm install
```

### Install backend dependencies

```bash
cd ../server
npm install
```

---

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

For the frontend (if using Vite), create a `.env` file inside the `client` directory.

```env
VITE_API_URL=http://localhost:5000
```

---

## Running the Application

### Start the backend

```bash
cd server
npm run dev
```

### Start the frontend

```bash
cd client
npm run dev
```

The frontend will typically run at:

```
http://localhost:5173
```

---

## Screenshots

Add screenshots of:

* Login Page
* Student Dashboard
* Admin Dashboard
* Company Management
* Job Listings
* Placement Analytics

---

## Future Enhancements

* Interview scheduling
* Resume upload and management
* Email notifications
* Student eligibility checker
* Export reports (CSV/PDF)
* Placement analytics with charts
* Company HR portal

---

## Contributing

Contributions are welcome. Feel free to fork the repository, create a feature branch, and submit a pull request.

---

## License

This project is intended for educational and learning purposes.

---

## Author

**Manasvi Arora**

If you found this project helpful, consider giving it a ⭐ on GitHub.
