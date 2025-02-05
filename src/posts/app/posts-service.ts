import { ObjectId } from "mongodb";
import TPostServiceInputModel from "../types/PostServiceInputModel";
import PostRepViewModel from "../types/PostRepViewModel";
import { Result } from "../../common/types/types";
import { RESULT_STATUS } from "../../common/settings";
import BlogRepViewModel from "../../blogs/types/BlogRepViewModel";
import { PostModelDb } from "../domain/post-model";
import { HydratedDocument } from "mongoose";
import BlogsRepository from "../../blogs/infrastructure/blogs-repository";
import PostsRepository from "../infrastructure/posts-repository";

class PostsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository
  ) {}

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
