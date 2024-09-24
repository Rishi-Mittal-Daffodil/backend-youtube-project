import mongoose from "mongoose";

const playlistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId(),
      ref: "User",
    },
    description: {
      type: String,
      required: true,
    },
    video: [
      {
        type: mongoose.Schema.Types.ObjectId(),
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
