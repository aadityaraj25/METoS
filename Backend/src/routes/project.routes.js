import express from "express";
import { createProject, getProjectById, getMyProjects, updateProject, deleteProject } from "../controllers/project.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/my", verifyJWT, getMyProjects);
router.get("/:projectId", getProjectById);
router.post("/", verifyJWT, createProject);
router.put("/:projectId", verifyJWT, updateProject);
router.delete("/:projectId", verifyJWT, deleteProject);

export default router;
