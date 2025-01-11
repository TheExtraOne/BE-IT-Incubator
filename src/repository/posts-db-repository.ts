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

const postsRepository = {
  getPostsCount: async (): Promise<number> => {
    return await postCollection.count({});
  },

  getPostsCountForBlogId: async (blogId: string): Promise<number> => {
    return await postCollection.count({ blogId });
  },

  getAllPosts: async (
    postsToSkip: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string
  ): Promise<TPostRepViewModel[] | []> =>
    await postCollection
      .find({})
      .sort({ [sortBy]: sortDirection === "asc" ? 1 : -1 })
      .skip(postsToSkip)
      .limit(pageSize)
      .toArray(),

  getAllPostsForBlogId: async (
    blogId: string,
    postsToSkip: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string
  ): Promise<TPostRepViewModel[] | []> =>
    await postCollection
      .find({ blogId })
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

  updatePostById: async (
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Promise<boolean> => {
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
