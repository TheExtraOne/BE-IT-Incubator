import { Collection, Db, MongoClient } from "mongodb";
import { SETTINGS } from "../settings";
import TPostRepViewModel from "./models/PostRepViewModel";
import TBlogRepViewModel from "./models/BlogRepViewModel";

export let blogCollection: Collection<TBlogRepViewModel>;
export let postCollection: Collection<TPostRepViewModel>;
export let client: MongoClient;

export const connectToDb = async (url: string) => {
  client = new MongoClient(url);
  const db: Db = client.db(SETTINGS.DB_NAME);

  blogCollection = db.collection<TBlogRepViewModel>(
    SETTINGS.BLOG_COLLECTION_NAME
  );
  postCollection = db.collection<TPostRepViewModel>(
    SETTINGS.POST_COLLECTION_NAME
  );

  try {
    await client.connect();
    console.log("Successful connected to db");
  } catch (e) {
    console.log(`Can not connect to db. ${e}`);
    await client.close();
  }
};
