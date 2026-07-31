import express, { urlencoded } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth/auth.routes.js'
import inviteRoutes from './routes/invite.routes.js'
import connectionRoutes from './routes/connection.routes.js'
import groupRoutes from './routes/group.routes.js'
import projectRoutes from './routes/project.routes.js'
import userRoutes from './routes/user.routes.js'
import joinRequestRoutes from './routes/joinRequest.routes.js'
import workspaceRoutes from './routes/workspace.routes.js'

dotenv.config();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:4001")
    .split(",")
    .map((o) => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl / Postman) and allowed origins
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",        authRoutes);
app.use("/api/v1/groups",      groupRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/projects",    projectRoutes);
app.use("/api/v1/users",       userRoutes);
app.use("/api/v1/join-requests", joinRequestRoutes);
app.use("/api/v1/workspace",   workspaceRoutes);

// Invite routes (covers /api/v1/groups/:groupId/invite and /api/v1/invite/*)
app.use("/api/v1", inviteRoutes);

// Health check
app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "METoS backend is running" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

export default app;
