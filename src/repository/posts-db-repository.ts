import { TSorting } from "../types";
import { postCollection } from "./db";
import TPostRepViewModel from "./models/PostRepViewModel";

type TNewPost = {
  id: string;
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
  ): Promise<number> => {
    return await postCollection.count(filter);
  },

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
      .sort({ [sortBy]: sortDirection === "asc" ? 1 : -1 })
      .skip(postsToSkip)
      .limit(pageSize)
      .toArray(),

  getPostById: async (id: string): Promise<TPostRepViewModel | null> =>
    await postCollection.findOne({ id }),

  createPost: async (newPost: TNewPost): Promise<TPostRepViewModel> => {
    await postCollection.insertOne(newPost);

    return newPost;
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
    const { matchedCount } = await postCollection.updateOne(
      { id },
      { $set: { title, shortDescription, content, blogId } }
    );

    return !!matchedCount;
  },

  deletePostById: async (id: string): Promise<boolean> => {
    const { deletedCount } = await postCollection.deleteOne({ id });

    return !!deletedCount;
  },
};

export default postsRepository;
