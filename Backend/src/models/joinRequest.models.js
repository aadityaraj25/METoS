import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
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
    },
    {
        timestamps: true,
    }
);

joinRequestSchema.index(
    { user: 1, group: 1 },
    { unique: true, partialFilterExpression: { status: "PENDING" } }
);

export const JoinRequest = mongoose.model("JoinRequest", joinRequestSchema);
