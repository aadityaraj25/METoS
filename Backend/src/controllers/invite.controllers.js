import jwt from "jsonwebtoken";
import { Group } from "../models/group.models.js";
import { Invite } from "../models/invite.models.js";
import { User } from "../models/user.models.js";
import { sendInviteEmail } from "../utils/emailService.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendInvite = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { email } = req.body;
    const leaderId = req.user._id;

    if (!email) throw new ApiError(400, "Email is required");

    const group = await Group.findById(groupId);
    if (!group) throw new ApiError(404, "Group not found");
    if (group.status !== "OPEN") throw new ApiError(400, "Group is not open for new members");
    if (group.leader.toString() !== leaderId.toString()) throw new ApiError(403, "Only the group leader can send invites");
    if (group.teamMembers.length >= group.teamSize) throw new ApiError(400, "Group is already full");

    const invitee = await User.findOne({ email: email.toLowerCase().trim() });
    if (!invitee) throw new ApiError(404, "No registered user found with that email");
    if (invitee._id.toString() === leaderId.toString()) throw new ApiError(400, "You cannot invite yourself");

    const isAlreadyMember =
        group.teamMembers.some((m) => m.toString() === invitee._id.toString()) ||
        group.leader.toString() === invitee._id.toString();
    if (isAlreadyMember) throw new ApiError(400, "User is already a member of this group");

    const existingInvite = await Invite.findOne({ inviteeEmail: email.toLowerCase().trim(), group: groupId, status: "PENDING" });
    if (existingInvite) throw new ApiError(409, "A pending invite already exists for this user in this group");

    const token = group.generateInviteToken(invitee._id);

    const invite = await Invite.create({
        invitedBy: leaderId,
        inviteeEmail: invitee.email,
        inviteeUser: invitee._id,
        group: groupId,
        token,
        status: "PENDING",
    });

    const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${token}`;

    try {
        await sendInviteEmail({
            toEmail: invitee.email,
            toName: invitee.fullName,
            inviterName: req.user.fullName,
            groupName: group.teamName,
            inviteLink,
        });
    } catch {
        await Invite.findByIdAndDelete(invite._id);
        throw new ApiError(500, "Failed to send invite email. Please try again.");
    }

    res.status(201).json(new ApiResponse(201, { inviteId: invite._id }, "Invite sent successfully"));
});

export const acceptInvite = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) throw new ApiError(400, "Token is required");

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.INVITE_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired invite token");
    }

    const { groupId, userId: tokenUserId } = decoded;
    if (tokenUserId.toString() !== userId.toString()) throw new ApiError(403, "This invite was not issued to you");

    const invite = await Invite.findOne({ token });
    if (!invite) throw new ApiError(404, "Invite not found");
    if (invite.status !== "PENDING") throw new ApiError(400, `Invite has already been ${invite.status.toLowerCase()}`);
    if (invite.expiresAt < new Date()) throw new ApiError(410, "This invite has expired");

    const group = await Group.findById(groupId);
    if (!group) throw new ApiError(404, "Group no longer exists");
    if (group.status !== "OPEN") throw new ApiError(400, "Group is no longer open for new members");
    if (group.teamMembers.length >= group.teamSize) throw new ApiError(400, "Group is full");

    const isAlreadyMember =
        group.teamMembers.some((m) => m.toString() === userId.toString()) ||
        group.leader.toString() === userId.toString();
    if (isAlreadyMember) throw new ApiError(400, "You are already a member of this group");

    group.teamMembers.push(userId);
    if (group.teamMembers.length >= group.teamSize) group.status = "CLOSED";
    await group.save();

    invite.status = "ACCEPTED";
    await invite.save();

    await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } });

    res.status(200).json(new ApiResponse(200, { groupId: group._id, teamName: group.teamName }, "Successfully joined the group"));
});

export const rejectInvite = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) throw new ApiError(400, "Token is required");

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.INVITE_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired invite token");
    }

    if (decoded.userId.toString() !== userId.toString()) throw new ApiError(403, "This invite was not issued to you");

    const invite = await Invite.findOne({ token });
    if (!invite) throw new ApiError(404, "Invite not found");
    if (invite.status !== "PENDING") throw new ApiError(400, `Invite has already been ${invite.status.toLowerCase()}`);

    invite.status = "REJECTED";
    await invite.save();

    res.status(200).json(new ApiResponse(200, null, "Invite rejected"));
});

export const getPendingInvites = asyncHandler(async (req, res) => {
    const invites = await Invite.find({ inviteeUser: req.user._id, status: "PENDING" })
        .populate("invitedBy", "fullName email username")
        .populate("group", "teamName problemStatement category skills teamSize");

    res.status(200).json(new ApiResponse(200, invites, "Pending invites fetched successfully"));
});
