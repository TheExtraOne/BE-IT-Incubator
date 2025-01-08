import { Collection, Db, MongoClient } from "mongodb";
import { SETTINGS } from "../settings";
import TBlogDbViewModel from "./models/BlogDbViewModel";
import TPostDbViewModel from "./models/PostDbViewModel";

export let blogCollection: Collection<TBlogDbViewModel>;
export let postCollection: Collection<TPostDbViewModel>;
export let client: MongoClient;

// export const connectToDb = async (url:string, dbName: string) => {
export const connectToDb = async () => {
  client = new MongoClient(SETTINGS.MONGO_URL);
  const db: Db = client.db(SETTINGS.DB_NAME);

  blogCollection = db.collection<TBlogDbViewModel>(
    SETTINGS.BLOG_COLLECTION_NAME
  );
  postCollection = db.collection<TPostDbViewModel>(
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
