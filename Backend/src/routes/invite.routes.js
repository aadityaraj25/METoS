import express from "express";
import {
    sendInvite,
    acceptInvite,
    rejectInvite,
    getPendingInvites,
} from "../controllers/invite.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// All invite routes require the user to be authenticated
router.use(verifyJWT);

// Leader sends an invite to a user by email
// POST /api/v1/groups/:groupId/invite
router.post("/groups/:groupId/invite", sendInvite);

// Invitee accepts their personal invite
// POST /api/v1/invite/accept
router.post("/invite/accept", acceptInvite);

// Invitee rejects their personal invite
// POST /api/v1/invite/reject
router.post("/invite/reject", rejectInvite);

// Invitee views all pending invites
// GET /api/v1/invite/pending
router.get("/invite/pending", getPendingInvites);

export default router;
