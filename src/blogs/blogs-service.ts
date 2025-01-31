import { ObjectId } from "mongodb";
import TBlogServiceInputModel from "./models/BlogServiceInputModel";
import blogsRepository from "./blogs-repository";
import TBlogRepViewModel from "./models/BlogRepViewModel";
import { BlogModelClass } from "../db/db";
import { HydratedDocument } from "mongoose";
import { RESULT_STATUS } from "../common/settings";
import { Result } from "../common/types/types";

const blogsService = {
  createBlog: async ({
    name,
    description,
    websiteUrl,
  }: TBlogServiceInputModel): Promise<string> => {
    const newBlog: TBlogRepViewModel = {
      _id: new ObjectId(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    const blogInstance: HydratedDocument<TBlogRepViewModel> =
      new BlogModelClass(newBlog);
    await blogsRepository.saveBlog(blogInstance);

    return newBlog._id.toString();
  },

  updateBlogById: async ({
    id,
    name,
    description,
    websiteUrl,
  }: {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
  }): Promise<Result> => {
    const blogInstance: HydratedDocument<TBlogRepViewModel> | null =
      await blogsRepository.getBlogById(id);
    if (!blogInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }

    blogInstance.name = name;
    blogInstance.description = description;
    blogInstance.websiteUrl = websiteUrl;
    await blogsRepository.saveBlog(blogInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  },

  deleteBlogById: async (id: string): Promise<Result> => {
    const blogInstance: HydratedDocument<TBlogRepViewModel> | null =
      await blogsRepository.getBlogById(id);
    if (!blogInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }

    await blogsRepository.deleteBlogById(blogInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  },
};

export default blogsService;
