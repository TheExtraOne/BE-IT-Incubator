import { ObjectId } from "mongodb";
import TPostRepViewModel from "./models/PostRepViewModel";
import { postCollection } from "../db/db";

const postsRepository = {
  createPost: async (newPost: TPostRepViewModel): Promise<string> => {
    const { insertedId } = await postCollection.insertOne(newPost);

    return insertedId.toString();
  },

  updatePostById: async ({
    id,
    title,
    shortDescription,
    content,
    blogId,
  }: {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
  }): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { matchedCount } = await postCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, shortDescription, content, blogId } }
    );

    return !!matchedCount;
  },

  deletePostById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await postCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return !!deletedCount;
  },
};

export default postsRepository;
