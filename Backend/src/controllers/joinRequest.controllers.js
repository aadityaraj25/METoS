import { JoinRequest } from "../models/joinRequest.models.js";
import { getIo, getReceiverSocketId } from "../sockets/socket.js";
import { Group } from "../models/group.models.js";
import { User } from "../models/user.models.js";
import { Invite } from "../models/invite.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createJoinRequest = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) throw new ApiError(404, "Group not found");
    if (group.status !== "OPEN") throw new ApiError(400, "Group is not open for new members");
    if (group.teamMembers.length >= group.teamSize) throw new ApiError(400, "Group is full");

    const isAlreadyMember = group.teamMembers.some((m) => m.toString() === userId.toString()) || group.leader.toString() === userId.toString();
    if (isAlreadyMember) throw new ApiError(400, "You are already a member of this group");

    const existingRequest = await JoinRequest.findOne({ user: userId, group: groupId, status: "PENDING" });
    if (existingRequest) throw new ApiError(409, "You have already requested to join this group");

    const joinReq = await JoinRequest.create({ user: userId, group: groupId, status: "PENDING" });

    res.status(201).json(new ApiResponse(201, { requestId: joinReq._id }, "Request to join sent successfully"));

    const leaderSocketId = getReceiverSocketId(group.leader.toString());
    if (leaderSocketId) {
        getIo().to(leaderSocketId).emit("new_notification", { type: "join_request" });
    }
});

export const getGroupJoinRequests = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const leaderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) throw new ApiError(404, "Group not found");
    if (group.leader.toString() !== leaderId.toString()) throw new ApiError(403, "Only the leader can view join requests");

    const requests = await JoinRequest.find({ group: groupId, status: "PENDING" }).populate("user", "fullName username email headline profileImage");

    res.status(200).json(new ApiResponse(200, requests, "Join requests fetched successfully"));
});

export const getMyPendingJoinRequests = asyncHandler(async (req, res) => {
    const leaderId = req.user._id;
    
    // Find all groups led by the current user
    const groups = await Group.find({ leader: leaderId }).select('_id');
    const groupIds = groups.map(g => g._id);

    // Find all pending join requests for those groups
    const requests = await JoinRequest.find({ group: { $in: groupIds }, status: "PENDING" })
        .populate("user", "fullName username email headline profileImage")
        .populate("group", "teamName");

    res.status(200).json(new ApiResponse(200, requests, "Pending join requests fetched successfully"));
});

export const acceptJoinRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const leaderId = req.user._id;

    const joinReq = await JoinRequest.findById(requestId).populate("group");
    if (!joinReq) throw new ApiError(404, "Join request not found");
    if (joinReq.status !== "PENDING") throw new ApiError(400, `Request already ${joinReq.status.toLowerCase()}`);

    const group = joinReq.group;
    if (group.leader.toString() !== leaderId.toString()) throw new ApiError(403, "Only the leader can accept join requests");
    if (group.status !== "OPEN") throw new ApiError(400, "Group is no longer open for new members");
    if (group.teamMembers.length >= group.teamSize) throw new ApiError(400, "Group is full");

    group.teamMembers.push(joinReq.user);
    if (group.teamMembers.length >= group.teamSize) {
        group.status = "CLOSED";
        // Also reject any other pending join requests for this group
        await JoinRequest.updateMany(
            { group: group._id, status: "PENDING", _id: { $ne: joinReq._id } },
            { $set: { status: "REJECTED" } }
        );
        // Also reject any pending invites for this group
        await Invite.updateMany(
            { group: group._id, status: "PENDING" },
            { $set: { status: "REJECTED" } }
        );
    }
    await group.save();

    joinReq.status = "ACCEPTED";
    await joinReq.save();

    await User.findByIdAndUpdate(joinReq.user, { $addToSet: { groups: group._id } });

    res.status(200).json(new ApiResponse(200, { groupId: group._id }, "User added to the group successfully"));
});

export const rejectJoinRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const leaderId = req.user._id;

    const joinReq = await JoinRequest.findById(requestId).populate("group");
    if (!joinReq) throw new ApiError(404, "Join request not found");
    if (joinReq.status !== "PENDING") throw new ApiError(400, `Request already ${joinReq.status.toLowerCase()}`);

    if (joinReq.group.leader.toString() !== leaderId.toString()) throw new ApiError(403, "Only the leader can reject join requests");

    joinReq.status = "REJECTED";
    await joinReq.save();

    res.status(200).json(new ApiResponse(200, null, "Join request rejected"));
});
