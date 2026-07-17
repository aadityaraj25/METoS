import { Group } from "../models/group.models.js";
import { User } from "../models/user.models.js";
import { Invite } from "../models/invite.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createGroup = asyncHandler(async (req, res) => {
    const { teamName, problemId, problemStatement, category, skills, teamSize, visibility } = req.body;

    if (!teamName || !problemId || !problemStatement || !category || !skills || teamSize == null || visibility == null) {
        throw new ApiError(400, "teamName, problemId, problemStatement, category, skills, teamSize, and visibility are required");
    }
    if (typeof teamSize !== "number" || teamSize < 1) throw new ApiError(400, "teamSize must be a positive number");

    const group = await Group.create({
        teamName, problemId, problemStatement, category, skills, teamSize, visibility,
        leader: req.user._id,
        status: "OPEN",
    });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { groups: group._id } });

    const populated = await Group.findById(group._id).populate("leader", "fullName username email profileImage");
    res.status(201).json(new ApiResponse(201, populated, "Group created successfully"));
});

export const getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId)
        .populate("leader", "fullName username email profileImage headline")
        .populate("teamMembers", "fullName username email profileImage headline");

    if (!group) throw new ApiError(404, "Group not found");

    res.status(200).json(new ApiResponse(200, {
        ...group.toObject(),
        slotsLeft: group.teamSize - group.teamMembers.length,
    }, "Group fetched"));
});

export const listGroups = asyncHandler(async (req, res) => {
    const { status = "OPEN", category, skills, q, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (category) filter.category = { $regex: category, $options: "i" };
    if (skills) filter.skills = { $regex: skills, $options: "i" };
    if (q) filter.$or = [
        { teamName: { $regex: q, $options: "i" } },
        { problemStatement: { $regex: q, $options: "i" } },
        { problemId: { $regex: q, $options: "i" } },
    ];

    const [groups, total] = await Promise.all([
        Group.find(filter)
            .populate("leader", "fullName username email profileImage")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Group.countDocuments(filter),
    ]);

    res.status(200).json(new ApiResponse(200, {
        groups: groups.map((g) => ({ ...g.toObject(), slotsLeft: g.teamSize - g.teamMembers.length })),
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    }, "Groups fetched"));
});

export const getMyGroups = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const groups = await Group.find({ $or: [{ leader: userId }, { teamMembers: userId }] })
        .populate("leader", "fullName username email profileImage")
        .populate("teamMembers", "fullName username email profileImage")
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, groups.map((g) => ({
        ...g.toObject(),
        slotsLeft: g.teamSize - g.teamMembers.length,
        role: g.leader._id.toString() === userId.toString() ? "leader" : "member",
    })), "Your groups fetched"));
});

export const updateGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId);
    if (!group) throw new ApiError(404, "Group not found");
    if (group.leader.toString() !== req.user._id.toString()) throw new ApiError(403, "Only the leader can update the group");

    const { teamName, problemId, problemStatement, category, skills, teamSize, visibility } = req.body;

    if (teamSize != null) {
        if (typeof teamSize !== "number" || teamSize < 1) throw new ApiError(400, "teamSize must be a positive number");
        if (teamSize < group.teamMembers.length) throw new ApiError(400, `teamSize cannot be less than current member count (${group.teamMembers.length})`);
        group.teamSize = teamSize;
        if (group.status === "CLOSED" && group.teamMembers.length < teamSize) group.status = "OPEN";
    }

    if (teamName !== undefined) group.teamName = teamName;
    if (problemId !== undefined) group.problemId = problemId;
    if (problemStatement !== undefined) group.problemStatement = problemStatement;
    if (category !== undefined) group.category = category;
    if (skills !== undefined) group.skills = skills;
    if (visibility !== undefined) group.visibility = visibility;

    await group.save();

    const updated = await Group.findById(req.params.groupId)
        .populate("leader", "fullName username email profileImage")
        .populate("teamMembers", "fullName username email profileImage");

    res.status(200).json(new ApiResponse(200, updated, "Group updated"));
});

export const closeGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId);
    if (!group) throw new ApiError(404, "Group not found");
    if (group.leader.toString() !== req.user._id.toString()) throw new ApiError(403, "Only the leader can close the group");
    if (group.status === "CLOSED") throw new ApiError(400, "Group is already closed");

    group.status = "CLOSED";
    await group.save();

    await Invite.updateMany({ group: req.params.groupId, status: "PENDING" }, { status: "REJECTED" });

    res.status(200).json(new ApiResponse(200, { status: "CLOSED" }, "Group closed"));
});

export const deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.groupId);
    if (!group) throw new ApiError(404, "Group not found");
    if (group.leader.toString() !== req.user._id.toString()) throw new ApiError(403, "Only the leader can delete the group");

    await Promise.all([
        User.updateMany({ _id: { $in: [group.leader, ...group.teamMembers] } }, { $pull: { groups: group._id } }),
        Invite.deleteMany({ group: req.params.groupId }),
        Group.findByIdAndDelete(req.params.groupId),
    ]);

    res.status(200).json(new ApiResponse(200, null, "Group deleted"));
});

export const leaveGroup = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const group = await Group.findById(req.params.groupId);
    if (!group) throw new ApiError(404, "Group not found");
    if (group.leader.toString() === userId.toString()) throw new ApiError(400, "Leader cannot leave. Delete the group instead.");

    const isMember = group.teamMembers.some((m) => m.toString() === userId.toString());
    if (!isMember) throw new ApiError(400, "You are not a member of this group");

    group.teamMembers = group.teamMembers.filter((m) => m.toString() !== userId.toString());
    if (group.status === "CLOSED" && group.teamMembers.length < group.teamSize) group.status = "OPEN";
    await group.save();

    await User.findByIdAndUpdate(userId, { $pull: { groups: group._id } });

    res.status(200).json(new ApiResponse(200, null, "You have left the group"));
});
