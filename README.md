# METEOS - A Skill Based Team Making Platform 

Its primary purpose is to help students:
discover teammates from the same college
create teams of exactly six members
find teams looking for specific skills
manage invitations and requests
verify that members belong to the same college
lock the team once complete

## Features

1. Let authenticated users create and manage their team by accepting invites or by requesting to join other team by creating an invite 

2. Provide a real time chat+meet for team discussion and ppt presentation

3. Let users analyse the data present on sih website through web scraping 

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS with dark mode support

## Project Structure

```text
METoS/
├── Backend/
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── constants.js 
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── db.js  
│   │   ├── controllers/
│   │   │   ├── auth.controllers.js 
│   │   │   └── team.controllers.js
│   │   ├── middlewares/
│   │   │   └── auth.middlewares.js #protected route 
│   │   ├── models/
│   │   │   ├── group.model.js
│   │   │   ├── team.model.js
│   │   │   └── user.models.js
│   │   ├── routes/
│   │   │   ├── team.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── auth/
│   │   │       └── auth.routes.js
│   │   ├── services/
│   │   │   └── email.js
│   │   ├── utils/
│   │   │   ├── apiErrors.js
│   │   │   ├── apIResponse.js
│   │   │   └── asyncHandler.js
│   │   └── web-scraping/
│   └── tests/
│       └── team.model.test.js
├── Frontend/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── assets/
│       ├── components/
│       │   └── Footer.jsx
│       └── pages/
│           ├── Landing.jsx
│           └── Login.jsx
├── LICENSE
└── Readme.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- MongoDB (local or Atlas)

### Installation

1. Clone the repository

   ```bash
   git clone <repo-url>
   cd METoS
   ```

2. Set up the backend

   ```bash
   cd Backend
   npm install
   ```

   Create a `.env` file inside the `Backend` folder with the following variables:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/METoS
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

   Start the backend server:

   ```bash
   npm run dev
   ```

3. Set up the frontend

   ```bash
   cd ../Frontend
   npm install
   npm run dev
   ```

4. Access the application

   - Frontend: http://localhost:4000
   - Backend API: http://localhost:5000

### Notes

- The backend runs with `nodemon` using the script in [Backend/package.json](Backend/package.json).
- The frontend uses Vite and is configured to run on port `4000` in [Frontend/vite.config.js](Frontend/vite.config.js).

## API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Authentication

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Log in an existing user
- `GET /auth/me` — Get the current authenticated user profile
- `PUT /auth/update` — Update the logged-in user's profile
- `PUT /auth/darkmode` — Toggle the dark mode preference for the logged-in user

### Teams

- `GET /teams/search` — Search for teams
- `POST /teams` — Create a new team

### Health Check

- `GET /` — Check whether the backend server is running

> Protected routes require a valid JWT token in the request headers.


