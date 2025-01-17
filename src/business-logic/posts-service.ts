import { TPostRepViewModel } from "../data-access/models";
import postsRepository from "../data-access/command-repository/posts-repository";
import { TPostServiceInputModel, TPostServiceViewModel } from "./models";
import { ObjectId } from "mongodb";
import blogsQueryRepository from "../data-access/query-repository/blogs-query-repository";
import { TBlogControllerViewModel } from "../api/models";

const postsService = {
  createPost: async ({
    title,
    shortDescription,
    content,
    blogId,
  }: TPostServiceInputModel): Promise<string | null> => {
    const blog: TBlogControllerViewModel | null =
      await blogsQueryRepository.getBlogById(blogId);
    if (!blog) return null;

    const newPost: TPostRepViewModel = {
      _id: new ObjectId(),
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };
    return await postsRepository.createPost(newPost);
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
  }): Promise<boolean> =>
    await postsRepository.updatePostById({
      id,
      title,
      shortDescription,
      content,
      blogId,
    }),

  deletePostById: async (id: string): Promise<boolean> =>
    await postsRepository.deletePostById(id),
};

export default postsService;
