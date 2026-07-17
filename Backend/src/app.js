import express, { urlencoded } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth/auth.routes.js'
import inviteRoutes from './routes/invite.routes.js'
import connectionRoutes from './routes/connection.routes.js'
import groupRoutes from './routes/group.routes.js'

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json());
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/connections", connectionRoutes);

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
