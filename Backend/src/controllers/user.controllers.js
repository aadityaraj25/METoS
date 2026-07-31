import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getUserByUsername = asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: req.params.username })
        .select("-password -refreshToken")
        .populate("groups", "teamName category status teamSize")
        .populate("projects", "title techStack githubUrl liveUrl");

    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
});

export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId)
        .select("-password -refreshToken")
        .populate("groups", "teamName category status teamSize")
        .populate("projects", "title techStack githubUrl liveUrl");

    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json(new ApiResponse(200, user, "User profile fetched"));
});

export const searchUsers = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter = q ? {
        $or: [
            { username: { $regex: q, $options: "i" } },
            { fullName: { $regex: q, $options: "i" } },
        ],
    } : {};

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("username fullName profileImage headline location skills bio")
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        User.countDocuments(filter),
    ]);

    const usersWithOnline = users.map((u) => ({
        ...u.toObject(),
        isOnline: true,
    }));

    res.status(200).json(new ApiResponse(200, {
        users: usersWithOnline,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    }, "Users fetched"));
});
