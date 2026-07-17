import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/emailService.js";
import jwt from "jsonwebtoken";
// import redis from "../config/redis.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
};

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch {
        throw new ApiError(500, "Token generation failed");
    }
};

export const register = asyncHandler(async (req, res) => {
    const { username, fullName, email, password } = req.body;
    if (!username || !fullName || !email || !password) {
        throw new ApiError(400, "username, fullName, email and password are required");
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) throw new ApiError(409, "User already exists with that email or username");

    const user = await User.create({ username, fullName, email, password });

    // Add new username to Redis cache to keep it in sync (commented out)
    // await redis.sadd("taken_usernames", username.toLowerCase());

    const created = await User.findById(user._id).select("-password -refreshToken");
    return res.status(201).json(new ApiResponse(201, created, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "Email and password are required");
    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordCorrect(password))) throw new ApiError(401, "Invalid credentials");
    const { accessToken, refreshToken } = await generateTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful"));
});

export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incoming) throw new ApiError(401, "Refresh token is required");
    let decoded;
    try {
        decoded = jwt.verify(incoming, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== incoming) throw new ApiError(401, "Refresh token is expired or already used");
    const { accessToken, refreshToken } = await generateTokens(user._id);
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
});

export const getMe = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, headline, bio, location, socialLinks, skills } = req.body;
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (headline !== undefined) updateData.headline = headline;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (socialLinks) updateData.socialLinks = socialLinks;
    if (skills) updateData.skills = skills;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true })
        .select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

export const toggleDarkMode = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.toogleMode = !user.toogleMode;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, { toogleMode: user.toogleMode }, "Dark mode toggled"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new ApiError(404, "No user found with that email");

    // Tying the secret to the current password hash invalidates the token after a reset
    const resetSecret = process.env.RESET_TOKEN_SECRET + user.password;
    const token = jwt.sign({ userId: user._id, email: user.email }, resetSecret, {
        expiresIn: process.env.RESET_TOKEN_EXPIRY || "15m",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;

    await sendEmail({
        to: user.email,
        subject: "Reset your METoS password",
        html: `
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#141414;color:#e8e8e8;border-radius:12px;border:1px solid #2a2a2a;">
  <h2 style="color:#4f8ef7;margin:0 0 16px;">Password Reset</h2>
  <p style="color:#9ca3af;margin:0 0 8px;">Hi ${user.fullName},</p>
  <p style="color:#9ca3af;margin:0 0 24px;">Click below to reset your password. This link expires in <strong style="color:#e8e8e8;">15 minutes</strong> and can only be used once.</p>
  <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:#fff;text-decoration:none;padding:12px 32px;border-radius:50px;font-weight:600;">Reset Password</a>
  <p style="color:#6b7280;font-size:13px;margin:24px 0 0;">If you didn't request this, ignore this email. Your password won't change.</p>
</div>`,
    });

    return res.status(200).json(new ApiResponse(200, null, "Password reset link sent to your email"));
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, userId, newPassword } = req.body;
    if (!token || !userId || !newPassword) throw new ApiError(400, "token, userId, and newPassword are required");
    if (newPassword.length < 6) throw new ApiError(400, "Password must be at least 6 characters");

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const resetSecret = process.env.RESET_TOKEN_SECRET + user.password;
    try {
        jwt.verify(token, resetSecret);
    } catch {
        throw new ApiError(401, "Reset link is invalid or has expired");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, "Password reset successfully. Please log in."));
});

export const checkUsernameAvailability = asyncHandler(async (req, res) => {
    const { username } = req.query;
    if (!username) throw new ApiError(400, "Username query parameter is required");

    // Check MongoDB directly for username availability (Redis fallback)
    const userExists = await User.exists({
        username: { $regex: new RegExp(`^${username}$`, "i") }
    });

    return res.status(200).json(new ApiResponse(200, { available: !userExists }, "Username availability checked"));
});
