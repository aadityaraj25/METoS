import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        inviteEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },

        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED"],
            default: "PENDING",
        },

        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from creation
            index: { expires: 0 },
        },
    },
    {
        timestamps: true,
    }
);

inviteSchema.index(
    {
        inviteeEmail: 1,
        group: 1,
    },
    {
        unique: true,
    }
);

export const Invite = mongoose.model("Invite", inviteSchema);
