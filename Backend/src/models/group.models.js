import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const groupSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: [true, "team name is required"],
    },
    problemId: {
        type: String,
        required: [true, "Problem ID is required"],
    },
    problemStatement: {
        type: String,
        required: [true, "Problem Statement is required"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
    },
    skills: {
        type: String,
        required: true,
    },
    teamSize: {
        type: Number,
        required: [true, "Team Size is required"],
        default: 1,
        min: 1,
    },
    visibility: {
        type: Boolean,
        required: true,
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "leader is required"],
    },
    teamMembers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    status: {
        type: String,
        enum: ["OPEN", "CLOSED"],
        default: "OPEN",
    },
}, {
    timestamps: true,
});

groupSchema.methods.generateInviteToken = function (userId) {
    return jwt.sign(
        {
            groupId: this._id,
            userId: userId,
        },
        process.env.INVITE_TOKEN_SECRET,
        {
            expiresIn: process.env.INVITE_TOKEN_EXPIRY || "7d",
        }
    );
};

export const Group = mongoose.model("Group", groupSchema);