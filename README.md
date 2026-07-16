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
