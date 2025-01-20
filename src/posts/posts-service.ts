import { ObjectId } from "mongodb";
import blogsQueryRepository from "../blogs/blogs-query-repository";
import TPostServiceInputModel from "./models/PostServiceInputModel";
import TBlogControllerViewModel from "../blogs/models/BlogControllerViewModel";
import TPostRepViewModel from "./models/PostRepViewModel";
import postsRepository from "./posts-repository";
import { Result } from "../common/types/types";
import { RESULT_STATUS } from "../common/settings";

const postsService = {
  createPost: async ({
    title,
    shortDescription,
    content,
    blogId,
  }: TPostServiceInputModel): Promise<Result<string | null>> => {
    const blog: TBlogControllerViewModel | null =
      await blogsQueryRepository.getBlogById(blogId);
    if (!blog) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "blogId", message: "Not found" }],
      };
    }

    const newPost: TPostRepViewModel = {
      _id: new ObjectId(),
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };
    const createdPostId = await postsRepository.createPost(newPost);
    return {
      status: RESULT_STATUS.SUCCESS,
      data: createdPostId,
      extensions: [],
    };
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
