import { Connection } from "../models/connections.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendConnectionRequest = asyncHandler(async (req, res) => {
    const senderId = req.user._id;
    const { userId: receiverId } = req.params;

    if (senderId.toString() === receiverId.toString()) throw new ApiError(400, "You cannot send a request to yourself");

    const receiver = await User.findById(receiverId).select("fullName username email");
    if (!receiver) throw new ApiError(404, "User not found");

    const existing = await Connection.findOne({
        $or: [{ sender: senderId, receiver: receiverId }, { sender: receiverId, receiver: senderId }],
    });

    if (existing) {
        if (existing.status === "PENDING") {
            if (existing.sender.toString() === receiverId.toString()) {
                throw new ApiError(409, "This user already sent you a request. Accept it instead.");
            }
            throw new ApiError(409, "Connection request already sent");
        }
        if (existing.status === "ACCEPTED") throw new ApiError(409, "Already connected");
        await Connection.findByIdAndDelete(existing._id);
    }

    const connection = await Connection.create({ sender: senderId, receiver: receiverId });

    res.status(201).json(new ApiResponse(201, {
        connectionId: connection._id,
        receiver: { _id: receiver._id, fullName: receiver.fullName, username: receiver.username },
    }, `Request sent to ${receiver.fullName}`));
});

export const acceptConnectionRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const connection = await Connection.findById(req.params.connectionId);
    if (!connection) throw new ApiError(404, "Request not found");
    if (connection.receiver.toString() !== userId.toString()) throw new ApiError(403, "Not authorised");
    if (connection.status !== "PENDING") throw new ApiError(400, `Request already ${connection.status.toLowerCase()}`);

    connection.status = "ACCEPTED";
    await connection.save();

    await Promise.all([
        User.findByIdAndUpdate(userId, { $addToSet: { connections: connection.sender } }),
        User.findByIdAndUpdate(connection.sender, { $addToSet: { connections: userId } }),
    ]);

    res.status(200).json(new ApiResponse(200, { connectionId: connection._id }, "Connection accepted"));
});

export const rejectConnectionRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const connection = await Connection.findById(req.params.connectionId);
    if (!connection) throw new ApiError(404, "Request not found");
    if (connection.receiver.toString() !== userId.toString()) throw new ApiError(403, "Not authorised");
    if (connection.status !== "PENDING") throw new ApiError(400, `Request already ${connection.status.toLowerCase()}`);

    connection.status = "REJECTED";
    await connection.save();
    res.status(200).json(new ApiResponse(200, null, "Request rejected"));
});

export const removeConnection = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const { userId: otherUserId } = req.params;

    const connection = await Connection.findOne({
        status: "ACCEPTED",
        $or: [{ sender: currentUserId, receiver: otherUserId }, { sender: otherUserId, receiver: currentUserId }],
    });
    if (!connection) throw new ApiError(404, "No active connection with this user");

    await Connection.findByIdAndDelete(connection._id);
    await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $pull: { connections: otherUserId } }),
        User.findByIdAndUpdate(otherUserId, { $pull: { connections: currentUserId } }),
    ]);

    res.status(200).json(new ApiResponse(200, null, "Connection removed"));
});

export const getMyConnections = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const connections = await Connection.find({
        status: "ACCEPTED",
        $or: [{ sender: userId }, { receiver: userId }],
    })
        .populate("sender", "fullName username email profileImage headline")
        .populate("receiver", "fullName username email profileImage headline");

    const peers = connections.map((conn) => {
        const isSender = conn.sender._id.toString() === userId.toString();
        return { connectionId: conn._id, connectedAt: conn.updatedAt, user: isSender ? conn.receiver : conn.sender };
    });

    res.status(200).json(new ApiResponse(200, peers, "Connections fetched"));
});

export const getPendingRequests = asyncHandler(async (req, res) => {
    const requests = await Connection.find({ receiver: req.user._id, status: "PENDING" })
        .populate("sender", "fullName username email profileImage headline");
    res.status(200).json(new ApiResponse(200, requests, "Pending requests fetched"));
});

export const getSentRequests = asyncHandler(async (req, res) => {
    const requests = await Connection.find({ sender: req.user._id, status: "PENDING" })
        .populate("receiver", "fullName username email profileImage headline");
    res.status(200).json(new ApiResponse(200, requests, "Sent requests fetched"));
});

export const cancelConnectionRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const connection = await Connection.findById(req.params.connectionId);
    if (!connection) throw new ApiError(404, "Request not found");
    if (connection.sender.toString() !== userId.toString()) throw new ApiError(403, "You can only cancel requests you sent");
    if (connection.status !== "PENDING") throw new ApiError(400, `Request already ${connection.status.toLowerCase()}`);
    await Connection.findByIdAndDelete(req.params.connectionId);
    res.status(200).json(new ApiResponse(200, null, "Request cancelled"));
});
