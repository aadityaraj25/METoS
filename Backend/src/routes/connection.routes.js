import express from "express";
import {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
    getMyConnections,
    getPendingRequests,
    getSentRequests,
    cancelConnectionRequest,
} from "../controllers/connection.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// All connection routes require authentication
router.use(verifyJWT);

// ─── List / Read ──────────────────────────────────────────────────────────────
// GET /api/v1/connections            — all accepted connections
router.get("/", getMyConnections);

// GET /api/v1/connections/pending    — incoming requests waiting for response
router.get("/pending", getPendingRequests);

// GET /api/v1/connections/sent       — outgoing requests you sent
router.get("/sent", getSentRequests);

// ─── Send / Cancel ────────────────────────────────────────────────────────────
// POST   /api/v1/connections/request/:userId   — send request to a user
router.post("/request/:userId", sendConnectionRequest);

// DELETE /api/v1/connections/cancel/:connectionId — cancel your own outgoing request
router.delete("/cancel/:connectionId", cancelConnectionRequest);

// ─── Accept / Reject ──────────────────────────────────────────────────────────
// POST /api/v1/connections/accept/:connectionId
router.post("/accept/:connectionId", acceptConnectionRequest);

// POST /api/v1/connections/reject/:connectionId
router.post("/reject/:connectionId", rejectConnectionRequest);

// ─── Remove ───────────────────────────────────────────────────────────────────
// DELETE /api/v1/connections/:userId — remove an existing connection
router.delete("/:userId", removeConnection);

export default router;
