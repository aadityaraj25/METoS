import express from "express";
import {
    createJoinRequest,
    getGroupJoinRequests,
    getMyPendingJoinRequests,
    getMySentJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
} from "../controllers/joinRequest.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.use(verifyJWT);

// POST /api/v1/join-requests/:groupId - User requests to join a group
router.post("/:groupId", createJoinRequest);

// GET /api/v1/join-requests/me/pending - Leader views all pending join requests across their groups
router.get("/me/pending", getMyPendingJoinRequests);

// GET /api/v1/join-requests/me/sent - User views all pending join requests they have sent
router.get("/me/sent", getMySentJoinRequests);

// GET /api/v1/join-requests/group/:groupId - Leader views pending requests for a group
router.get("/group/:groupId", getGroupJoinRequests);

// POST /api/v1/join-requests/:requestId/accept - Leader accepts request
router.post("/:requestId/accept", acceptJoinRequest);

// POST /api/v1/join-requests/:requestId/reject - Leader rejects request
router.post("/:requestId/reject", rejectJoinRequest);

export default router;
