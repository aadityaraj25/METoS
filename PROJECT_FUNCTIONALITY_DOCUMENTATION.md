# METoS Platform — Comprehensive Functionality & Architecture Documentation

## 1. Executive Summary

**METoS** is a full-stack platform designed for developers, builders, and technical creators to network, collaborate on open problems, form project teams, and manage interactive workspaces.

The application combines a high-performance **React + Vite** frontend with a robust **Node.js + Express + MongoDB** backend.

---

## 2. Technology Stack & System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vite + React)                   │
│  - React Router DOM v6             - Custom Glassmorphism CSS     │
│  - Auth Context API                - Event-driven Sync (Window)   │
└─────────────────────────────────┬────────────────────────────────┘
                                  │  REST APIs (HTTP/Cookies/Bearer)
┌─────────────────────────────────▼────────────────────────────────┐
│                        BACKEND (Node.js + Express)               │
│  - Express.js (v5)                 - JWT Authentication (Access/   │
│  - Mongoose ODM (MongoDB)            Refresh Tokens)             │
│  - Nodemailer Email Service        - Bcryptjs Password Hashing    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Module Functionalities

### 3.1 Authentication & Onboarding
* **Landing Page (`Landing.jsx`)**: Public entry point showcasing platform stats, value propositions, interactive feature teasers, and authentication CTAs.
* **Register (`Register.jsx`)**:
  * Real-time username availability checking directly against MongoDB.
  * Form validation for email, password strength, and user details.
* **Login (`Login.jsx`)**:
  * Accepts email or username as credentials.
  * Secure HTTPOnly cookie handling and Auth Context state bootstrap.
* **Password Recovery (`ForgotPassword.jsx`, `ResetPassword.jsx`)**:
  * Request password reset link via Nodemailer.
  * Time-limited tokenized password reset form.

### 3.2 Explore & Discovery Feed (`Explore.jsx`)
* **Profile Sidebar**: Displays personal avatar, full name, headline, location, project/connection/group statistics, and user skills.
* **Discovery Feed**:
  * Search & Filter tabs for **Builders**, **Problems**, and **Teams**.
  * User cards featuring profile images, truncated 2-line bio clamps (`text-overflow: ellipsis`), skill chips, and status indicators.
* **Action Buttons**: Custom-styled `.btn-connect` and `.btn-remove` buttons supporting connection requests and cancellations.
* **Real-time Event Synchronization**: Listens to custom `connectionUpdated` browser events to instantly update UI state and connection counts without manual page refreshes.

### 3.3 Profile & Connections (`Profile.jsx`)
* View personal profile or external developer profiles.
* Edit profile details (Full Name, Headline, Bio, Location, Social Links, Skills).
* Tabbed view for **Projects**, **Groups**, and active **Connections**.

### 3.4 Workspaces & Groups (`Workspace.jsx`, `CreateGroup.jsx`)
* **Create Group**: Form to create public or invite-only collaboration groups with category and tag selections.
* **Workspace View**:
  * Member list and join request management.
  * Project showcases and task boards.
  * Group messaging / discussion channels.

### 3.5 Top Navigation (`TopNav.jsx`)
* Universal search bar.
* Connection notification drawer displaying incoming connection requests with Accept/Decline actions.
* Reactive request badge counter synchronized via window events.
* User profile dropdown and dark mode toggles.

---

## 4. Backend Architecture & Data Models

### 4.1 Core Data Models (`src/models/`)

| Model | File | Description |
| :--- | :--- | :--- |
| **User** | `user.models.js` | User identity, credentials, hashed passwords, refresh tokens, profile info, location, and skills. |
| **Connection** | `connections.models.js` | Tracks connection states (`pending`, `accepted`) between requester and recipient users. |
| **Group** | `group.models.js` | Group spaces with owner, members, public/invite-only privacy, tags, and cover images. |
| **Invite** | `invite.models.js` | Secure tokenized email group invitations with status tracking (`pending`, `accepted`, `expired`). |
| **JoinRequest** | `joinRequest.models.js` | Member applications to join groups. |
| **Project** | `project.models.js` | Group or user project showcases. |
| **Task** | `task.models.js` | Kanban tasks assigned to group members. |
| **Message** | `message.models.js` | Chat messages exchanged within group workspaces. |

### 4.2 Security & Authentication Pipeline
* **Token Architecture**:
  * **Access Token**: Short-lived (15 minutes), used for route authorization.
  * **Refresh Token**: Long-lived (7 days), stored securely in MongoDB and HTTPOnly cookies.
* **Password Hashing**: Pre-save Mongoose hook using `bcryptjs`.
* **JWT Verification Middleware (`verifyJWT`)**: Extracts tokens from `Authorization: Bearer` headers or HTTPOnly cookies, validates signatures, and attaches sanitized user objects to `req.user`.

---

## 5. Summary of API Endpoints

### Auth Routes (`/api/v1/auth`)
* `POST /register`: Register a new developer user.
* `POST /login`: Authenticate user & issue access/refresh tokens.
* `POST /logout`: Unset refresh tokens & clear cookies.
* `POST /refresh-token`: Issue new token pair using valid refresh token.
* `GET /me`: Get current authenticated user profile.
* `PATCH /profile`: Update profile information.
* `GET /check-username`: Query MongoDB for real-time username availability.
* `POST /forgot-password`: Send password reset email.
* `POST /reset-password`: Reset password using verified token.

### Connection Routes (`/api/v1/connections`)
* `POST /request/:recipientId`: Send connection request.
* `POST /accept/:requestId`: Accept incoming connection request.
* `POST /reject/:requestId`: Reject connection request.
* `POST /remove/:connectionId`: Remove connection.
* `GET /pending`: List pending incoming connection requests.
* `GET /my`: List all accepted connections.

### Group & Workspace Routes (`/api/v1/groups`, `/api/v1/workspaces`)
* `POST /`: Create group.
* `GET /`: Search & list public groups.
* `GET /:id`: Fetch group details, members, and workspace tasks/projects.
* `POST /:id/join`: Submit join request or join public group.

---

## 6. Real-time Event-Driven Synchronization

To provide a seamless user experience without full page reloads:
1. When a user accepts or sends a connection request, API helper functions (`src/api/connections.js`) dispatch a custom `connectionUpdated` browser event:
   ```javascript
   window.dispatchEvent(new CustomEvent("connectionUpdated", { detail }));
   ```
2. Components like `Explore.jsx` and `TopNav.jsx` register event listeners on mount to immediately refresh feed data, badge counters, and connection lists in real time.
