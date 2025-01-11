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
  getAllPosts: async (): Promise<TPostRepViewModel[] | []> =>
    await postCollection.find({}).toArray(),

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
