import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createProject = asyncHandler(async (req, res) => {
    const { title, description, githubUrl, liveUrl, techStack } = req.body;
    if (!title || !description) throw new ApiError(400, "title and description are required");

    const project = await Project.create({
        title,
        description,
        githubUrl: githubUrl || "",
        liveUrl: liveUrl || "",
        techStack: techStack || [],
        owner: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { projects: project._id } });

    res.status(201).json(new ApiResponse(201, project, "Project created"));
});

export const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId)
        .populate("owner", "fullName username profileImage");
    if (!project) throw new ApiError(404, "Project not found");
    res.status(200).json(new ApiResponse(200, project, "Project fetched"));
});

export const getMyProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, projects, "Your projects"));
});

export const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) throw new ApiError(404, "Project not found");
    if (project.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorised");

    const { title, description, githubUrl, liveUrl, techStack } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (liveUrl !== undefined) project.liveUrl = liveUrl;
    if (techStack !== undefined) project.techStack = techStack;

    await project.save();
    res.status(200).json(new ApiResponse(200, project, "Project updated"));
});

export const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) throw new ApiError(404, "Project not found");
    if (project.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorised");

    await Promise.all([
        Project.findByIdAndDelete(req.params.projectId),
        User.findByIdAndUpdate(req.user._id, { $pull: { projects: project._id } }),
    ]);

    res.status(200).json(new ApiResponse(200, null, "Project deleted"));
});
