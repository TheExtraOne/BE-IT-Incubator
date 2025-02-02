import { ObjectId } from "mongodb";
import TBlogServiceInputModel from "./models/BlogServiceInputModel";
import blogsRepository from "./blogs-repository";
import { BlogModelDb } from "../db/db";
import { HydratedDocument } from "mongoose";
import { RESULT_STATUS } from "../common/settings";
import { Result } from "../common/types/types";
import BlogRepViewModel from "./models/BlogRepViewModel";

class BlogService {
  async createBlog({
    name,
    description,
    websiteUrl,
  }: TBlogServiceInputModel): Promise<string> {
    const newBlog: BlogRepViewModel = new BlogRepViewModel(
      new ObjectId(),
      name,
      description,
      websiteUrl,
      new Date().toISOString(),
      false
    );

    const blogInstance: HydratedDocument<BlogRepViewModel> = new BlogModelDb(
      newBlog
    );
    await blogsRepository.saveBlog(blogInstance);

    return newBlog._id.toString();
  }

  async updateBlogById({
    id,
    name,
    description,
    websiteUrl,
  }: {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
  }): Promise<Result> {
    const blogInstance: HydratedDocument<BlogRepViewModel> | null =
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
  }

  async deleteBlogById(id: string): Promise<Result> {
    const blogInstance: HydratedDocument<BlogRepViewModel> | null =
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
  }
}

export default new BlogService();
