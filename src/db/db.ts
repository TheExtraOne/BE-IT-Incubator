import mongoose from "mongoose";
import { SETTINGS } from "../common/settings";
import blogSchema from "../blogs/domain/blog-schema";
import commentSchema from "../comments/domain/comment-schema";
import likeSchema from "../likes/domain/like-schema";
import postSchema from "../posts/domain/post-schema";
import rateLimitSchema from "../rate-limiting/domain/rate-limit-schema";
import refreshTokenSchema from "../security/domain/refresh-token-schema";
import userSchema from "../users/domain/user-schema";

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
export const LikeModelDb = mongoose.model(
  SETTINGS.COLLECTION_NAMES.LIKES,
  likeSchema
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
