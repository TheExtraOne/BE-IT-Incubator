import { ObjectId } from "mongodb";
import { SORT_DIRECTION } from "../settings";
import { TSorting } from "../types";
import { postCollection } from "./db";
import TPostRepViewModel from "./models/PostRepViewModel";

type TNewPost = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

type TSkipsLimits = {
  postsToSkip: number;
  pageSize: number;
};

const postsRepository = {
  getPostsCount: async (
    filter: Record<string, string> | undefined = {}
  ): Promise<number> => await postCollection.countDocuments(filter),

  getAllPosts: async ({
    postsToSkip,
    pageSize,
    sortBy,
    sortDirection,
    filter = {},
  }: {
    filter?: Record<string, string>;
  } & TSkipsLimits &
    TSorting): Promise<TPostRepViewModel[] | []> =>
    await postCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(postsToSkip)
      .limit(pageSize)
      .toArray(),

  getPostById: async (id: string): Promise<TPostRepViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    return await postCollection.findOne({ _id: new ObjectId(id) });
  },

  createPost: async (newPost: TNewPost): Promise<string> => {
    const { insertedId } = await postCollection.insertOne(
      newPost as TPostRepViewModel
    );

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
