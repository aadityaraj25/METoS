import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
    {
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        inviteeEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        inviteeUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED"],
            default: "PENDING",
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            index: { expires: 0 },
        },
    },
    {
        timestamps: true,
    }
);

inviteSchema.index(
    { inviteeEmail: 1, group: 1 },
    { unique: true, partialFilterExpression: { status: "PENDING" } }
);

export const Invite = mongoose.model("Invite", inviteSchema);