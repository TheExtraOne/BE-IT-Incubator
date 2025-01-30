import { ObjectId } from "mongodb";
import TPostRepViewModel from "./models/PostRepViewModel";
import { PostModelClass } from "../db/db";
import { HydratedDocument } from "mongoose";

const postsRepository = {
  savePost: async (
    post: HydratedDocument<TPostRepViewModel>
  ): Promise<void> => {
    await post.save();
  },

  getPostById: async (
    id: string
  ): Promise<HydratedDocument<TPostRepViewModel> | null> => {
    if (!ObjectId.isValid(id)) return null;

    const post: HydratedDocument<TPostRepViewModel> | null =
      await PostModelClass.findById(new ObjectId(id));

    return post;
  },

  deletePostById: async (
    post: HydratedDocument<TPostRepViewModel>
  ): Promise<void> => {
    await post.deleteOne();
  },
};

export default postsRepository;
