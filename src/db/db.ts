import { Collection, Db, MongoClient } from "mongodb";
import { SETTINGS } from "../common/settings";
import TBlogRepViewModel from "../blogs/models/BlogRepViewModel";
import TPostRepViewModel from "../posts/models/PostRepViewModel";
import TCommentRepViewModel from "../comments/models/CommentRepViewModel";
import TUserAccountRepViewModel from "../users/models/UserAccountRepViewModel";
import TRefreshTokensMetaRepViewModel from "../security/models/RefreshTokensMetaRepViewModel";
import TRateLimitingRepViewModel from "../rate-limiting/models/RateLimitingRepViewModel";

export let blogCollection: Collection<TBlogRepViewModel>;
export let postCollection: Collection<TPostRepViewModel>;
export let userCollection: Collection<TUserAccountRepViewModel>;
export let commentCollection: Collection<TCommentRepViewModel>;
export let refreshTokensMetaCollection: Collection<TRefreshTokensMetaRepViewModel>;
export let rateLimitingCollection: Collection<TRateLimitingRepViewModel>;
export let client: MongoClient;

export const connectToDb = async (url: string): Promise<boolean> => {
  client = new MongoClient(url);
  const db: Db = client.db(SETTINGS.DB_NAME);

  blogCollection = db.collection<TBlogRepViewModel>(
    SETTINGS.COLLECTION_NAMES.BLOGS
  );
  postCollection = db.collection<TPostRepViewModel>(
    SETTINGS.COLLECTION_NAMES.POSTS
  );
  userCollection = db.collection<TUserAccountRepViewModel>(
    SETTINGS.COLLECTION_NAMES.USERS
  );
  commentCollection = db.collection<TCommentRepViewModel>(
    SETTINGS.COLLECTION_NAMES.COMMENTS
  );
  refreshTokensMetaCollection = db.collection<TRefreshTokensMetaRepViewModel>(
    SETTINGS.COLLECTION_NAMES.REFRESH_TOKENS_META
  );
  rateLimitingCollection = db.collection<TRateLimitingRepViewModel>(
    SETTINGS.COLLECTION_NAMES.RATE_LIMITING
  );

  try {
    await client.connect();
    console.log("Successful connected to db");
    return true;
  } catch (e) {
    console.log(`Can not connect to db. ${e}`);
    await client.close();
    return false;
  }
};
