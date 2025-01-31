import { ObjectId } from "mongodb";
import TPostServiceInputModel from "./models/PostServiceInputModel";
import TPostRepViewModel from "./models/PostRepViewModel";
import postsRepository from "./posts-repository";
import { Result } from "../common/types/types";
import { RESULT_STATUS } from "../common/settings";
import blogsRepository from "../blogs/blogs-repository";
import TBlogRepViewModel from "../blogs/models/BlogRepViewModel";
import { PostModelClass } from "../db/db";
import { HydratedDocument } from "mongoose";

const postsService = {
  createPost: async ({
    title,
    shortDescription,
    content,
    blogId,
  }: TPostServiceInputModel): Promise<Result<string | null>> => {
    const blog: TBlogRepViewModel | null = await blogsRepository.getBlogById(
      blogId
    );

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
    const postInstance = new PostModelClass(newPost);
    await postsRepository.savePost(postInstance);
    const createdPostId = postInstance._id.toString();

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
  }): Promise<Result> => {
    const postInstance: HydratedDocument<TPostRepViewModel> | null =
      await postsRepository.getPostById(id);
    if (!postInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }

    postInstance.title = title;
    postInstance.shortDescription = shortDescription;
    postInstance.content = content;
    postInstance.blogId = blogId;
    await postsRepository.savePost(postInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  },

  deletePostById: async (id: string): Promise<Result> => {
    const postInstance: HydratedDocument<TPostRepViewModel> | null =
      await postsRepository.getPostById(id);
    if (!postInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }

    await postsRepository.deletePostById(postInstance);
    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  },
};

export default postsService;
