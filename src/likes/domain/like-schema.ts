import mongoose from "mongoose";
import { LIKE_STATUS, LIKE_TYPE } from "../../common/settings";
import LikeRepViewModel from "./LikeRepViewModel";

const likeSchema = new mongoose.Schema<LikeRepViewModel>({
  status: { type: String, enum: LIKE_STATUS, required: true },
  authorId: { type: String, required: true },
  parentId: { type: String, required: true },
  createdAt: { type: Date, required: true },
  likeType: { type: String, enum: LIKE_TYPE, required: true },
});

export default likeSchema;
