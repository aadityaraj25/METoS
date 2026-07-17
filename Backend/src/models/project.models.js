import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    githubUrl: { type: String, default: "", trim: true },
    liveUrl: { type: String, default: "", trim: true },
    techStack: [{ type: String, trim: true }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
