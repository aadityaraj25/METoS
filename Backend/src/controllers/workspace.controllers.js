import { Task } from "../models/task.models.js";
import { Message } from "../models/message.models.js";
import { Group } from "../models/group.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Check if user is a member of the group
const checkGroupMembership = async (groupId, userId) => {
    const group = await Group.findById(groupId);
    if (!group) throw new ApiError(404, "Group not found");
    const isMember = group.teamMembers.some((m) => m.toString() === userId.toString()) || group.leader.toString() === userId.toString();
    if (!isMember) throw new ApiError(403, "You are not a member of this group");
    return group;
};

// ─── TASKS ────────────────────────────────────────────────────────────────────

export const getTasks = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    await checkGroupMembership(groupId, req.user._id);

    const tasks = await Task.find({ group: groupId }).populate("assignedTo", "fullName username profileImage");
    res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

export const createTask = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { title, description, assignedTo } = req.body;
    await checkGroupMembership(groupId, req.user._id);

    if (!title) throw new ApiError(400, "Task title is required");

    const task = await Task.create({
        title,
        description,
        assignedTo: assignedTo || null,
        group: groupId,
    });

    const populatedTask = await Task.findById(task._id).populate("assignedTo", "fullName username profileImage");
    res.status(201).json(new ApiResponse(201, populatedTask, "Task created successfully"));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");
    await checkGroupMembership(task.group, req.user._id);

    task.status = status;
    await task.save();

    res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");
    await checkGroupMembership(task.group, req.user._id);

    await Task.findByIdAndDelete(taskId);
    res.status(200).json(new ApiResponse(200, null, "Task deleted"));
});

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

export const getMessages = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    await checkGroupMembership(groupId, req.user._id);

    const messages = await Message.find({ group: groupId })
        .populate("sender", "fullName username profileImage headline")
        .sort({ createdAt: 1 })
        .limit(100);

    res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export const sendMessage = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { content } = req.body;
    await checkGroupMembership(groupId, req.user._id);

    if (!content) throw new ApiError(400, "Message content is required");

    const message = await Message.create({
        content,
        group: groupId,
        sender: req.user._id,
    });

    const populatedMessage = await Message.findById(message._id).populate("sender", "fullName username profileImage headline");
    res.status(201).json(new ApiResponse(201, populatedMessage, "Message sent"));
});
