# METoS API Documentation & Flows

This document details the route list, parameter shapes, security mechanisms, Redis implementation details, and sequential user flows of the METoS Backend API.

---

## Security & Middleware (verifyJWT)
Most mutating and private endpoints are protected by the `verifyJWT` middleware.
- **Authorization check:** The token is read from the `Authorization: Bearer <token>` header or the `accessToken` httpOnly cookie.
- **Payload mapping:** Maps token identifiers to `req.user`, excluding sensitive info (password, refresh tokens).
- **Session management:** Uses short-lived Access Tokens paired with long-lived Refresh Tokens stored securely in HTTPOnly cookies.

---

## Redis Cache Implementation Details

To handle real-time username availability checks with high performance, Redis is integrated as an in-memory cache layer. 

### Data Structure
- **Redis Set (`taken_usernames`):** We use a Redis Set to store all registered usernames in lowercase. Sets ensure uniqueness and allow O(1) membership checks.

### Core Commands Used
1. **`SISMEMBER taken_usernames <username>`**: Used during the check endpoint. Returns `1` if the username is taken, and `0` if it is free.
2. **`SADD taken_usernames <username>`**: Adds a new username to the set on user registration.
3. **`SREM taken_usernames <username>`**: Removes a username from the set (useful for username updates or user deletions).

### One-Time Synchronization (Hydration)
If existing users exist in MongoDB, the `syncUsernamesToRedis` utility script loads all usernames from MongoDB using a lean query (`User.find({}, "username").lean()`), converts them to lowercase, and bulk-inserts them into the Redis Set using pipeline insertion (`redis.sadd`).

---

## Route Directory

### 1. Authentication (`/api/v1/auth`)

| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Public | Registers a new user. Cache-injects username into Redis. |
| **POST** | `/login` | Public | Logs in. Sets HTTPOnly cookies for tokens. |
| **POST** | `/logout` | 🔒 Private | Destroys cookies and clears refresh token in DB. |
| **POST** | `/refresh` | Public | Swaps refresh token (cookie/body) for a new pair. |
| **GET** | `/me` | 🔒 Private | Retrieves current authenticated profile. |
| **PUT** | `/update` | 🔒 Private | Updates bio, location, headline, socialLinks, skills. |
| **PUT** | `/darkmode` | 🔒 Private | Toggles the user interface dark mode flag. |
| **GET** | `/check-username` | Public | Checks if a username is available in Redis (O(1)). |
| **POST** | `/forgot-password` | Public | Dispatches single-use password reset link. |
| **POST** | `/reset-password` | Public | Updates user password using reset token. |

---

### 2. Group Management (`/api/v1/groups`)

| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public | Lists and searches all groups (paginated). |
| **GET** | `/my` | 🔒 Private | Lists groups where the caller is leader or member. |
| **POST** | `/` | 🔒 Private | Creates a new group. Leader slot is separate from members. |
| **GET** | `/:groupId` | Public | Fetches a single group with computed `slotsLeft`. |
| **PUT** | `/:groupId` | 🔒 Leader | Updates details (cannot shrink size below active members). |
| **PATCH** | `/:groupId/close`| 🔒 Leader | Manually closes group; auto-rejects pending invites. |
| **DELETE**| `/:groupId/leave`| 🔒 Member | Non-leader leaves group; re-opens if size limit permits. |
| **DELETE**| `/:groupId` | 🔒 Leader | Deletes group; cascades cleanup to members and invites. |

---

### 3. Invitation System (`/api/v1`)

| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/groups/:groupId/invite` | 🔒 Leader | Emails signed, non-transferable token to invitee. |
| **POST** | `/invite/accept` | 🔒 Private | Accepts invitation; joins group. |
| **POST** | `/invite/reject` | 🔒 Private | Rejects invitation. |
| **GET** | `/invite/pending` | 🔒 Private | Lists all pending invitations for the caller. |

---

### 4. Connection System (`/api/v1/connections`)

| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | 🔒 Private | Lists all accepted developer connections (peer-to-peer). |
| **GET** | `/pending` | 🔒 Private | Lists incoming connection requests. |
| **GET** | `/sent` | 🔒 Private | Lists outgoing connection requests. |
| **POST** | `/request/:userId` | 🔒 Private | Sends a connection request. |
| **POST** | `/accept/:connectionId` | 🔒 Private | Accepts an incoming request. |
| **POST** | `/reject/:connectionId` | 🔒 Private | Rejects an incoming request. |
| **DELETE**| `/cancel/:connectionId` | 🔒 Private | Cancels an outgoing request. |
| **DELETE**| `/:userId` | 🔒 Private | Removes an established connection. |

---

### 5. Project Portfolio (`/api/v1/projects`)

| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/my` | 🔒 Private | Lists all projects owned by the caller. |
| **POST** | `/` | 🔒 Private | Creates a project and updates owner array. |
| **GET** | `/:projectId` | Public | Fetches detailed project data. |
| **PUT** | `/:projectId` | 🔒 Owner | Updates project title, stack, descriptions, URLs. |
| **DELETE**| `/:projectId` | 🔒 Owner | Deletes project and pulls reference from user profile. |

---

### 6. Public User Discovery (`/api/v1/users`)

| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/search` | Public | Queries users by name or username (paginated). |
| **GET** | `/id/:userId` | Public | Fetches user profile by ObjectId. |
| **GET** | `/:username` | Public | Fetches user profile by username. |

---

## Core Architectural Flows

### 1. Real-time Username Availability Flow
```mermaid
sequenceDiagram
    participant FE as Frontend (Debounced Input)
    participant REDIS as Redis (In-Memory Set)
    participant DB as MongoDB (User Model)

    Note over FE: User stops typing for 500ms
    FE->>API: GET /check-username?username=aditya25
    API->>REDIS: SISMEMBER taken_usernames aditya25
    alt Username exists in Set
        REDIS-->>API: returns 1
        API-->>FE: HTTP 200 { available: false }
    else Username is free
        REDIS-->>API: returns 0
        API-->>FE: HTTP 200 { available: true }
    end
    
    Note over FE: User submits registration form
    FE->>API: POST /register { username: "aditya25", ... }
    API->>DB: User.create({ username: "aditya25", ... })
    API->>REDIS: SADD taken_usernames aditya25
    API-->>FE: HTTP 201 Created
```

---

### 2. Single-Use Password Reset Flow
To prevent link-reuse vulnerabilities without storing state in MongoDB, tokens are signed using the user's current hashed password as part of the JWT secret.
```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB as MongoDB (User Model)
    participant Email as Nodemailer (OAuth2)

    User->>API: POST /forgot-password { email: "xyz@abc.com" }
    API->>DB: Find user by email
    DB-->>API: returns user object (current password hash: HASH_A)
    Note over API: Sign JWT using SECRET = env.RESET_SECRET + HASH_A
    API->>Email: Send reset link with JWT
    Email-->>User: Delivers Link to Inbox
    
    Note over User: Clicks link and submits new password
    User->>API: POST /reset-password { token, userId, newPassword }
    API->>DB: Find user by userId
    DB-->>API: returns user object (password hash: HASH_A)
    Note over API: Verify JWT using SECRET = env.RESET_SECRET + HASH_A
    alt Verification Success
        API->>DB: Hash new password (HASH_B) and save
        API-->>User: HTTP 200 "Success"
    else Verification Fails / Reuse Attempt
        Note over API: Verification fails because DB password is now HASH_B
        API-->>User: HTTP 401 "Invalid or expired token"
    end
```

---

### 3. Secure Group Invite & Acceptance Flow
Signed invitation tokens are tied specifically to the target group and invitee ID, preventing token-hijacking or link sharing.
```mermaid
sequenceDiagram
    participant Leader
    participant Invitee
    participant API
    participant DB as MongoDB & Redis

    Leader->>API: POST /groups/:groupId/invite { email }
    Note over API: Verify group is OPEN & leader owns it
    API->>DB: Check invitee exists, not in group, no pending invite
    Note over API: Sign token: { groupId, userId }
    API->>DB: Create Invite record (PENDING)
    API->>Invitee: Email invitation link
    
    Note over Invitee: Clicks link and accepts
    Invitee->>API: POST /invite/accept { token }
    Note over API: Decode token & verify invitee matches logged-in user
    API->>DB: Find Invite and check status is PENDING
    API->>DB: Add user to Group.teamMembers & Group ID to User.groups
    alt Group teamSize reached
        API->>DB: Set Group.status = CLOSED
        API->>DB: Auto-reject all other pending invites for this group
    end
    API-->>Invitee: HTTP 200 "Joined Group"
```

---

### 4. Bidirectional Connection Flow
Matchmaking relationships are direction-agnostic and synced across both user profiles atomically.
```mermaid
sequenceDiagram
    participant User A
    participant User B
    participant API
    participant DB as MongoDB

    User A->>API: POST /connections/request/:userId_B
    Note over API: Verify no active/pending connection
    API->>DB: Create Connection record (sender=A, receiver=B, status=PENDING)
    API-->>User A: HTTP 201 "Sent"
    
    User B->>API: GET /connections/pending
    API-->>User B: Returns list of pending incoming requests (including A)
    User B->>API: POST /connections/accept/:connectionId
    API->>DB: Update Connection status = ACCEPTED
    API->>DB: Add B to UserA.connections & A to UserB.connections ($addToSet)
    API-->>User B: HTTP 200 "Connected"
```
