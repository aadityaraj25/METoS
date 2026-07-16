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

## POST /users/auth/signup

### Zod Schema

```ts
{
  username: string (3-30 chars, letters, numbers, underscores only),
  fullName: string (min 2 chars),
  email: email format,
  password: string (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special character),
  confirmPassword: must match password
}
```

### Success (201)

```json
{
  "success": true,
  "data": {
    "username": "ananya_garg",
    "fullName": "Ananya Garg",
    "email": "ananya@gmail.com"
  },
  "message": "User registered successfully"
}
```

> **Note:** Password and `confirmPassword` should **not** be returned in the response.

### Duplicate Email (400)

```json
{
  "success": false,
  "error": "Email already exists"
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "email": "Invalid email address",
    "password": "Password must contain at least one uppercase letter"
  }
}
```

---

## POST /users/auth/login

### Zod Schema

```ts
{
  email: email format,
  password: string
}
```

### Success (200)

```json
{
  "success": true,
  "data": {
    "token": "JWT_TOKEN_HERE"
  },
  "message": "Login successful"
}
```

### Invalid Credentials (401)

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "email": "Invalid email address"
  }
}
```
**Invalid Credentials (400):**

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

## GET /users/me

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Success (200)

```json
{
  "success": true,
  "data": {
    "_id": "6876f2d9c1b2d93e4f6a1234",
    "username": "ananya_garg",
    "fullName": "Ananya Garg",
    "email": "ananya@gmail.com",
    "profileImage": "https://example.com/profile.jpg",
    "headline": "Full Stack Developer",
    "bio": "Passionate MERN developer",
    "location": "Delhi, India",
    "experience": 2,
    "socialLinks": {
      "github": "https://github.com/ananyagarg2",
      "linkedin": "https://linkedin.com/in/ananyagarg",
      "portfolio": "https://ananyagarg.dev",
      "twitter": ""
    },
    "skills": [
      {
        "name": "React",
        "proficiency": 5
      },
      {
        "name": "Node.js",
        "proficiency": 4
      }
    ],
    "projects": [
      "6876f2d9c1b2d93e4f6a1111",
      "6876f2d9c1b2d93e4f6a2222"
    ],
    "groups": [
      "6876f2d9c1b2d93e4f6a3333"
    ],
    "connections": [
      "6876f2d9c1b2d93e4f6a4444"
    ],
    "createdAt": "2026-07-16T10:30:00.000Z",
    "updatedAt": "2026-07-16T12:45:00.000Z"
  }
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## PUT /users/update

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Zod Schema

```ts
{
  fullName?: string (min 2 chars),
  profileImage?: string (valid URL),
  headline?: string,
  bio?: string,
  location?: string,
  experience?: number (min 0),
  socialLinks?: {
    github?: valid URL,
    linkedin?: valid URL,
    portfolio?: valid URL,
    twitter?: valid URL
  },
  skills?: [
    {
      name: string,
      proficiency: number (1-5)
    }
  ]
}
```

> **Note:** All fields are optional. The user can update one or more fields in a single request.

### Success (200)

```json
{
  "success": true,
  "data": {
    "_id": "6876f2d9c1b2d93e4f6a1234",
    "username": "ananya_garg",
    "fullName": "Ananya Garg",
    "email": "ananya@gmail.com",
    "profileImage": "https://example.com/profile.jpg",
    "headline": "Full Stack Developer",
    "bio": "Passionate MERN developer",
    "location": "Delhi, India",
    "experience": 2,
    "socialLinks": {
      "github": "https://github.com/ananyagarg2",
      "linkedin": "https://linkedin.com/in/ananyagarg",
      "portfolio": "https://ananyagarg.dev",
      "twitter": ""
    },
    "skills": [
      {
        "name": "React",
        "proficiency": 5
      },
      {
        "name": "Node.js",
        "proficiency": 4
      }
    ]
  },
  "message": "Profile updated successfully"
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "experience": "Experience must be greater than or equal to 0"
  }
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```
## GET /users/:id

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters

```ts
{
  id: string (MongoDB ObjectId)
}
```

### Success (200)

```json
{
  "success": true,
  "data": {
    "_id": "6876f2d9c1b2d93e4f6a1234",
    "username": "ananya_garg",
    "fullName": "Ananya Garg",
    "profileImage": "https://example.com/profile.jpg",
    "headline": "Full Stack Developer",
    "bio": "Passionate MERN developer",
    "location": "Delhi, India",
    "experience": 2,
    "socialLinks": {
      "github": "https://github.com/ananyagarg2",
      "linkedin": "https://linkedin.com/in/ananyagarg",
      "portfolio": "https://ananyagarg.dev",
      "twitter": ""
    },
    "skills": [
      {
        "name": "React",
        "proficiency": 5
      },
      {
        "name": "Node.js",
        "proficiency": 4
      }
    ],
    "projects": [
      "6876f2d9c1b2d93e4f6a1111",
      "6876f2d9c1b2d93e4f6a2222"
    ],
    "groups": [
      "6876f2d9c1b2d93e4f6a3333"
    ]
  }
}
```

### User Not Found (404)

```json
{
  "success": false,
  "error": "User not found"
}
```

### Invalid User ID (400)

```json
{
  "success": false,
  "error": "Invalid user id"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## GET /users/search

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Query Parameters

```ts
{
  q: string (required, username or full name)
}
```

Example:

```http
GET /users/search?q=ananya
```

### Success (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "6876f2d9c1b2d93e4f6a1234",
      "username": "ananya_garg",
      "fullName": "Ananya Garg",
      "profileImage": "https://example.com/profile.jpg",
      "headline": "Full Stack Developer"
    },
    {
      "_id": "6876f2d9c1b2d93e4f6a5678",
      "username": "ananya123",
      "fullName": "Ananya Sharma",
      "profileImage": "",
      "headline": "Frontend Developer"
    }
  ]
}
```

### No Users Found (200)

```json
{
  "success": true,
  "data": []
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": "Search query is required"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```
# Group APIs

---

## POST /groups

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Zod Schema

```ts
{
  teamName: string (min 3 chars),
  problemId: string,
  problemStatement: string,
  category: string,
  skills: string,
  teamSize: number (min 1),
  visibility: boolean
}
```

> **Note:** `leader` is automatically set to the authenticated user (`req.user._id`).

### Success (201)

```json
{
  "success": true,
  "data": {
    "_id": "6876f2d9c1b2d93e4f6a1234",
    "teamName": "Code Warriors",
    "problemId": "SIH2026-101",
    "problemStatement": "1623",
    "category": "Software",
    "skills": "MERN, Machine Learning",
    "teamSize": 6,
    "visibility": true,
    "leader": "6876f2d9c1b2d93e4f6a5678",
    "teamMembers": [],
    "status": "OPEN",
    "createdAt": "2026-07-16T10:30:00.000Z",
    "updatedAt": "2026-07-16T10:30:00.000Z"
  },
  "message": "Group created successfully"
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": {
    "teamName": "Team name is required"
  }
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## GET /groups

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Success (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "6876f2d9c1b2d93e4f6a1234",
      "teamName": "Code Warriors",
      "problemId": "SIH2026-101",
      "problemStatement": "1623",
      "category": "Software",
      "skills": "MERN, Machine Learning",
      "teamSize": 6,
      "visibility": true,
      "leader": {
        "_id": "6876f2d9c1b2d93e4f6a5678",
        "username": "ananya_garg",
        "fullName": "Ananya Garg"
      },
      "status": "OPEN"
    }
  ]
}
```

---

## GET /groups/:id

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters

```ts
{
  id: string (MongoDB ObjectId)
}
```

### Success (200)

```json
{
  "success": true,
  "data": {
    "_id": "6876f2d9c1b2d93e4f6a1234",
    "teamName": "Code Warriors",
    "problemId": "SIH2026-101",
    "problemStatement": "1623",
    "category": "Software",
    "skills": "MERN, Machine Learning",
    "teamSize": 6,
    "visibility": true,
    "leader": {
      "_id": "6876f2d9c1b2d93e4f6a5678",
      "username": "ananya_garg",
      "fullName": "Ananya Garg"
    },
    "teamMembers": [
      {
        "_id": "6876f2d9c1b2d93e4f6a1111",
        "username": "rahul01",
        "fullName": "Rahul Sharma"
      },
      {
        "_id": "6876f2d9c1b2d93e4f6a2222",
        "username": "priya09",
        "fullName": "Priya Verma"
      }
    ],
    "status": "OPEN",
    "createdAt": "2026-07-16T10:30:00.000Z",
    "updatedAt": "2026-07-16T10:30:00.000Z"
  }
}
```

### Group Not Found (404)

```json
{
  "success": false,
  "error": "Group not found"
}
```

---

## PUT /groups/:id

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters

```ts
{
  id: string (MongoDB ObjectId)
}
```

### Zod Schema

```ts
{
  teamName?: string (min 3 chars),
  problemId?: string,
  problemStatement?: string,
  category?: string,
  skills?: string,
  teamSize?: number (min 1),
  visibility?: boolean,
  status?: "OPEN" | "CLOSED"
}
```

> **Note:** All fields are optional.

### Success (200)

```json
{
  "success": true,
  "data": {
    "_id": "6876f2d9c1b2d93e4f6a1234",
    "teamName": "Code Warriors",
    "status": "CLOSED",
    "visibility": false
  },
  "message": "Group updated successfully"
}
```

### Group Not Found (404)

```json
{
  "success": false,
  "error": "Group not found"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## DELETE /groups/:id

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters

```ts
{
  id: string (MongoDB ObjectId)
}
```

### Success (200)

```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

### Group Not Found (404)

```json
{
  "success": false,
  "error": "Group not found"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```
# Invite APIs

---

## POST /invites

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Zod Schema

```ts
{
  groupId: string (MongoDB ObjectId),
  message?: string (max 300 chars)
}
```

> **Note:** The sender (`invitee`) is automatically set to the authenticated user.

### Success (201)

```json
{
  "success": true,
  "data": {
    "_id": "6890abc123",
    "group": "6876f2d9c1b2d93e4f6a1234",
    "invitee": "6876f2d9c1b2d93e4f6a5678",
    "status": "PENDING"
  },
  "message": "Join request sent successfully"
}
```

### Duplicate Request (400)

```json
{
  "success": false,
  "error": "You have already requested to join this group"
}
```

---

## GET /invites

Returns all pending invites for groups led by the authenticated user.

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Success (200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "6890abc123",
      "group": {
        "_id": "6876f2d9c1b2d93e4f6a1234",
        "teamName": "Code Warriors"
      },
      "invitee": {
        "_id": "6876f2d9c1b2d93e4f6a5678",
        "username": "rahul01",
        "fullName": "Rahul Sharma"
      },
      "status": "PENDING",
      "createdAt": "2026-07-16T12:30:00.000Z"
    }
  ]
}
```

---

## PUT /invites/:id/accept

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters

```ts
{
  id: string (MongoDB ObjectId)
}
```

### Success (200)

```json
{
  "success": true,
  "message": "Invite accepted successfully"
}
```
> **Condition**
> Team size not equal to max_size
 

> **Action performed:**
>
> - Invite status → `ACCEPTED`
> - User added to `teamMembers`

### Invite Not Found (404)

```json
{
  "success": false,
  "error": "Invite not found"
}
```

---

## PUT /invites/:id/reject

### Authentication

**Required:** Bearer Token

```http
Authorization: Bearer <JWT_TOKEN>
```

### Path Parameters

```ts
{
  id: string (MongoDB ObjectId)
}
```

### Success (200)

```json
{
  "success": true,
  "message": "Invite rejected successfully"
}
```

> **Action performed:**
>
> - Invite status → `REJECTED`

### Invite Not Found (404)

```json
{
  "success": false,
  "error": "Invite not found"
}
```
