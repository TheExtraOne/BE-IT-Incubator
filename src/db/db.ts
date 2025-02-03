import mongoose from "mongoose";
import { LIKE_STATUS, SETTINGS } from "../common/settings";
import BlogRepViewModel from "../blogs/models/BlogRepViewModel";
import PostRepViewModel from "../posts/models/PostRepViewModel";
import CommentRepViewModel from "../comments/models/CommentRepViewModel";
import UserAccountRepViewModel from "../users/models/UserAccountRepViewModel";
import RefreshTokensMetaRepViewModel from "../security/models/RefreshTokensMetaRepViewModel";
import TRateLimitingRepViewModel from "../rate-limiting/models/RateLimitingRepViewModel";

const blogSchema = new mongoose.Schema<BlogRepViewModel>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
  isMembership: { type: Boolean, required: true },
});
const postSchema = new mongoose.Schema<PostRepViewModel>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true },
});
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
    myStatus: { type: String, enum: LIKE_STATUS, required: true },
  },
});
const userSchema = new mongoose.Schema<UserAccountRepViewModel>({
  accountData: {
    userName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  emailConfirmation: {
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    isConfirmed: { type: Boolean, required: true },
  },
  passwordResetConfirmation: {
    recoveryCode: { type: String, default: null },
    expirationDate: { type: Date, default: null },
    isConfirmed: { type: Boolean, default: null },
  },
});
const refreshTokenSchema = new mongoose.Schema<RefreshTokensMetaRepViewModel>({
  ip: { type: String, required: true },
  title: { type: String, required: true },
  lastActiveDate: { type: String, required: true },
  expirationDate: { type: String, required: true },
  userId: { type: String, required: true },
});
const rateLimitSchema = new mongoose.Schema<TRateLimitingRepViewModel>({
  ip: { type: String, required: true },
  URL: { type: String, required: true },
  date: { type: Date, required: true },
});

export const BlogModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.BLOGS,
  blogSchema
);
export const PostModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.POSTS,
  postSchema
);
export const CommentModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.COMMENTS,
  commentSchema
);
export const UserModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.USERS,
  userSchema
);
export const RefreshTokenModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.REFRESH_TOKENS,
  refreshTokenSchema
);
export const RateLimitModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.RATE_LIMITS,
  rateLimitSchema
);

export const connectToDb = async (url: string): Promise<boolean> => {
  try {
    await mongoose.connect(url, { dbName: SETTINGS.DB_NAME });
    console.log("Successful connected to db");
    return true;
  } catch (e) {
    console.log(`Can not connect to db. ${e}`);
    await mongoose.disconnect();
    return false;
  }
};
