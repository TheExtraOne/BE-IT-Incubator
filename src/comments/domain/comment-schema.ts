import mongoose from "mongoose";
import CommentRepViewModel from "./CommentRepViewModel";

const commentSchema = new mongoose.Schema<CommentRepViewModel>({
  content: { type: String, required: true },
  commentatorInfo: {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
  },
  createdAt: { type: String, required: true },
  postId: { type: String, required: true },
  likesInfo: {
    likesCount: { type: Number, required: true },
    dislikesCount: { type: Number, required: true },
  },
});

export default commentSchema;
