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

<img width="932" height="427" alt="image" src="https://github.com/user-attachments/assets/2c9a84ef-bdab-41b2-aecb-b40a9421be8a" />

<img width="928" height="411" alt="image" src="https://github.com/user-attachments/assets/84e733ae-4ceb-4c48-b6b4-0a8b0d0a31e0" />

<img width="935" height="430" alt="image" src="https://github.com/user-attachments/assets/c102be9f-35e1-4ca7-a5d0-502638cb2a4d" />

<img width="932" height="418" alt="image" src="https://github.com/user-attachments/assets/4ea9f546-e2ca-4572-9270-a9b2f156488d" />

<img width="926" height="416" alt="image" src="https://github.com/user-attachments/assets/2004db37-fd07-436d-90a3-de08d14b324a" />


---

## Future Enhancements

* Interview scheduling
* Resume upload and management
* Email notifications
* Placement analytics with charts

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
