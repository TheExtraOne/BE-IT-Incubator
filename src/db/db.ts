import { Collection, Db, MongoClient } from "mongodb";
import { SETTINGS } from "../settings";
import TBlogRepViewModel from "../blogs/models/BlogRepViewModel";
import TPostRepViewModel from "../posts/models/PostRepViewModel";
import TUserRepViewModel from "../users/models/UserRepViewModel";

export let blogCollection: Collection<TBlogRepViewModel>;
export let postCollection: Collection<TPostRepViewModel>;
export let userCollection: Collection<TUserRepViewModel>;
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
  userCollection = db.collection<TUserRepViewModel>(
    SETTINGS.COLLECTION_NAMES.USERS
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
