import express from "express";
import { getUserByUsername, getUserById, searchUsers } from "../controllers/user.controllers.js";

const router = express.Router();

router.get("/search", searchUsers);
router.get("/id/:userId", getUserById);
router.get("/:username", getUserByUsername);

export default router;
