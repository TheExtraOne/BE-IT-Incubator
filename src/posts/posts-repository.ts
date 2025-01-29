import { ObjectId } from "mongodb";
import TPostRepViewModel from "./models/PostRepViewModel";
import { PostModelClass } from "../db/db";

const postsRepository = {
  createPost: async (newPost: TPostRepViewModel): Promise<string> => {
    const { _id: insertedId } = await PostModelClass.create(newPost);

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
    const { matchedCount } = await PostModelClass.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, shortDescription, content, blogId } }
    );

    return !!matchedCount;
  },

  deletePostById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await PostModelClass.deleteOne({
      _id: new ObjectId(id),
    });

    return !!deletedCount;
  },
};

export default postsRepository;
