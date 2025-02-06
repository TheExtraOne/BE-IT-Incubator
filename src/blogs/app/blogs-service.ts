import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";
import { RESULT_STATUS } from "../../common/settings";
import BlogRepViewModel from "../types/BlogRepViewModel";
import TBlogServiceInputModel from "../types/BlogServiceInputModel";
import BlogsRepository from "../infrastructure/blogs-repository";
import { Result } from "../../common/types/types";
import { BlogModelDb } from "../domain/blog-model";
import { inject, injectable } from "inversify";

@injectable()
class BlogService {
  constructor(
    @inject("BlogsRepository") protected blogsRepository: BlogsRepository
  ) {}

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
    await this.blogsRepository.saveBlog(blogInstance);

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
      await this.blogsRepository.getBlogById(id);
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
    await this.blogsRepository.saveBlog(blogInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async deleteBlogById(id: string): Promise<Result> {
    const blogInstance: HydratedDocument<BlogRepViewModel> | null =
      await this.blogsRepository.getBlogById(id);
    if (!blogInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }

    await this.blogsRepository.deleteBlogById(blogInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }
}

export default BlogService;
