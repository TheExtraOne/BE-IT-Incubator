import { Collection, Db, MongoClient } from "mongodb";
import { SETTINGS } from "../settings";
import TBlogViewModel from "../models/BlogViewModel";
import TPostViewModel from "../models/PostViewModel";

// Get an access to DB
const client: MongoClient = new MongoClient(SETTINGS.MONGO_URL);

export const db: Db = client.db(SETTINGS.DB_NAME);

export const blogCollection: Collection<TBlogViewModel> =
  db.collection<TBlogViewModel>(SETTINGS.BLOG_COLLECTION_NAME);
export const postCollection: Collection<TPostViewModel> =
  db.collection<TPostViewModel>(SETTINGS.POST_COLLECTION_NAME);

export const runDb = async () => {
  try {
    await client.connect();
    await client.db("products").command({ ping: 1 });
    console.log("Successful connected to db");
  } catch (e) {
    console.log(`Can not connect to db. ${e}`);
    await client.close();
  }
};
