import express from "express";
import {
    createGroup,
    getGroupById,
    listGroups,
    getMyGroups,
    updateGroup,
    closeGroup,
    deleteGroup,
    leaveGroup,
} from "../controllers/group.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// ─── Public routes ────────────────────────────────────────────────────────────

// GET /api/v1/groups            — list/search groups (status, category, skills, q, page, limit)
router.get("/", listGroups);

// ─── Protected routes — static paths first (must come before /:groupId) ──────

// GET /api/v1/groups/my         — groups the logged-in user is in (leader or member)
router.get("/my", verifyJWT, getMyGroups);

// POST /api/v1/groups           — create a new group
router.post("/", verifyJWT, createGroup);

// ─── Dynamic :groupId routes ──────────────────────────────────────────────────

// GET /api/v1/groups/:groupId   — get a single group (public)
router.get("/:groupId", getGroupById);

// PUT /api/v1/groups/:groupId   — update group details (leader only)
router.put("/:groupId", verifyJWT, updateGroup);

// PATCH /api/v1/groups/:groupId/close  — manually close group (leader only)
router.patch("/:groupId/close", verifyJWT, closeGroup);

// DELETE /api/v1/groups/:groupId/leave — leave a group (member only)
router.delete("/:groupId/leave", verifyJWT, leaveGroup);

// DELETE /api/v1/groups/:groupId       — delete group entirely (leader only)
router.delete("/:groupId", verifyJWT, deleteGroup);

export default router;
