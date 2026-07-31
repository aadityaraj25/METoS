import express from "express";
import {
    getTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    getMessages,
    sendMessage,
} from "../controllers/workspace.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.use(verifyJWT);

// Tasks
router.get("/:groupId/tasks", getTasks);
router.post("/:groupId/tasks", createTask);
router.patch("/tasks/:taskId", updateTaskStatus);
router.delete("/tasks/:taskId", deleteTask);

// Messages
router.get("/:groupId/messages", getMessages);
router.post("/:groupId/messages", sendMessage);

export default router;
