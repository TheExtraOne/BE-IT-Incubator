import mongoose from "mongoose";
import LikeRepViewModel from "../types/LikeRepViewModel";
import { LIKE_STATUS, LIKE_TYPE } from "../../../common/settings";

const likeSchema = new mongoose.Schema<LikeRepViewModel>({
  status: { type: String, enum: LIKE_STATUS, required: true },
  authorId: { type: String, required: true },
  parentId: { type: String, required: true },
  createdAt: { type: Date, required: true },
  likeType: { type: String, enum: LIKE_TYPE, required: true },
  login: { type: String, required: true },
});

export default likeSchema;
