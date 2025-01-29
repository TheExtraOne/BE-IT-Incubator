import mongoose from "mongoose";
import { SETTINGS } from "../common/settings";
import TBlogRepViewModel from "../blogs/models/BlogRepViewModel";
import TPostRepViewModel from "../posts/models/PostRepViewModel";
import TCommentRepViewModel from "../comments/models/CommentRepViewModel";
import TUserAccountRepViewModel from "../users/models/UserAccountRepViewModel";
import TRefreshTokensMetaRepViewModel from "../security/models/RefreshTokensMetaRepViewModel";
import TRateLimitingRepViewModel from "../rate-limiting/models/RateLimitingRepViewModel";

const blogSchema = new mongoose.Schema<TBlogRepViewModel>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
  isMembership: { type: Boolean, required: true },
});
const postSchema = new mongoose.Schema<TPostRepViewModel>({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true },
});
const commentSchema = new mongoose.Schema<TCommentRepViewModel>({
  content: { type: String, required: true },
  commentatorInfo: {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
  },
  createdAt: { type: String, required: true },
  postId: { type: String, required: true },
});
const userSchema = new mongoose.Schema<TUserAccountRepViewModel>({
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
});
const refreshTokenSchema = new mongoose.Schema<TRefreshTokensMetaRepViewModel>({
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

export const BlogModelClass = mongoose.model(
  SETTINGS.COLLECTION_NAMES.BLOGS,
  blogSchema
);
export const PostModelClass = mongoose.model(
  SETTINGS.COLLECTION_NAMES.POSTS,
  postSchema
);
export const CommentModelClass = mongoose.model(
  SETTINGS.COLLECTION_NAMES.COMMENTS,
  commentSchema
);
export const UserModelClass = mongoose.model(
  SETTINGS.COLLECTION_NAMES.USERS,
  userSchema
);
export const RefreshTokenModelClass = mongoose.model(
  SETTINGS.COLLECTION_NAMES.REFRESH_TOKENS_META,
  refreshTokenSchema
);
export const RateLimitModelClass = mongoose.model(
  SETTINGS.COLLECTION_NAMES.RATE_LIMITING,
  rateLimitSchema
);

export const connectToDb = async (url: string): Promise<boolean> => {
  try {
    await mongoose.connect(`${url}/${SETTINGS.DB_NAME}`);
    console.log("Successful connected to db");
    return true;
  } catch (e) {
    console.log(`Can not connect to db. ${e}`);
    await mongoose.disconnect();
    return false;
  }
};
