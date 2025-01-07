import TPostViewModel from "../models/PostViewModel";
import { postCollection, blogCollection } from "./db";

const postsRepository = {
  getAllPosts: async (): Promise<TPostViewModel[]> => {
    const posts = await postCollection.find({}).toArray();

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
    }));
  },
  getPostById: async (id: string): Promise<TPostViewModel | null> => {
    const post = await postCollection.findOne({ id });

    return post
      ? {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
        }
      : null;
  },
  createPost: async (
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Promise<TPostViewModel | null> => {
    const blog = await blogCollection.findOne({ id: blogId });
    if (!blog) return null;

    const newPost = {
      id: `${Date.now() + Math.random()}`,
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };

    await postCollection.insertOne(newPost);

    return {
      id: newPost.id,
      title,
      shortDescription,
      content,
      blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
    };
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
