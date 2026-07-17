import express from "express";
import {
    register,
    login,
    logout,
    refreshAccessToken,
    getMe,
    updateProfile,
    toggleDarkMode,
    forgotPassword,
    resetPassword,
    checkUsernameAvailability
} from "../../controllers/auth.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middlewares.js";

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);   // uses refresh token, no verifyJWT needed
router.get("/check-username", checkUsernameAvailability);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ── Protected routes ──────────────────────────────────────────────────────────
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getMe);
router.put("/update", verifyJWT, updateProfile);
router.put("/darkmode", verifyJWT, toggleDarkMode);

export default router;
