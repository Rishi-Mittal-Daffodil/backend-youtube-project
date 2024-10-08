import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.objectID(),
      ref: "User",
    },
    video: {
      type: mongoose.Schema.Types.objectID(),
      ref: "Video",
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
