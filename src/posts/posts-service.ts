import { ObjectId } from "mongodb";
import TPostServiceInputModel from "./models/PostServiceInputModel";
import PostRepViewModel from "./models/PostRepViewModel";
import PostsRepository from "./posts-repository";
import { Result } from "../common/types/types";
import { RESULT_STATUS } from "../common/settings";
import BlogsRepository from "../blogs/blogs-repository";
import BlogRepViewModel from "../blogs/models/BlogRepViewModel";
import { PostModelDb } from "../db/db";
import { HydratedDocument } from "mongoose";

class PostsService {
  private blogsRepository: BlogsRepository;
  private postsRepository: PostsRepository;

  constructor() {
    this.blogsRepository = new BlogsRepository();
    this.postsRepository = new PostsRepository();
  }

  async createPost({
    title,
    shortDescription,
    content,
    blogId,
  }: TPostServiceInputModel): Promise<Result<string | null>> {
    const blog: BlogRepViewModel | null =
      await this.blogsRepository.getBlogById(blogId);

    if (!blog) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "blogId", message: "Not found" }],
      };
    }

    const newPost: PostRepViewModel = new PostRepViewModel(
      new ObjectId(),
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
      new Date().toISOString()
    );
    const postInstance = new PostModelDb(newPost);
    await this.postsRepository.savePost(postInstance);
    const createdPostId = postInstance._id.toString();

    return {
      status: RESULT_STATUS.SUCCESS,
      data: createdPostId,
      extensions: [],
    };
  }

  async updatePostById({
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
  }): Promise<Result> {
    const postInstance: HydratedDocument<PostRepViewModel> | null =
      await this.postsRepository.getPostById(id);
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
    await this.postsRepository.savePost(postInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async deletePostById(id: string): Promise<Result> {
    const postInstance: HydratedDocument<PostRepViewModel> | null =
      await this.postsRepository.getPostById(id);
    if (!postInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }

    await this.postsRepository.deletePostById(postInstance);
    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }
}

export default PostsService;
