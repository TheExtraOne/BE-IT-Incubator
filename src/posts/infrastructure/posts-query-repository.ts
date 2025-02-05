import { ObjectId } from "mongodb";
import { SORT_DIRECTION } from "../../common/settings";
import { TResponseWithPagination } from "../../common/types/types";
import TPostControllerViewModel from "../types/PostControllerViewModel";
import PostRepViewModel from "../types/PostRepViewModel";
import { PostModelDb } from "../domain/post-model";

class PostsQueryRepository {
  private mapPost(post: PostRepViewModel): TPostControllerViewModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
    };
  }

  private mapPosts(
    posts: PostRepViewModel[] | []
  ): TPostControllerViewModel[] | [] {
    return posts.map(this.mapPost);
  }

  private async getPostsCount(blogId: string | null): Promise<number> {
    const query = PostModelDb.countDocuments();
    if (blogId) query.where("blogId", blogId);

    return await query;
  }

  async getAllPosts({
    blogId,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: {
    blogId: string | null;
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: SORT_DIRECTION;
  }): Promise<TResponseWithPagination<TPostControllerViewModel[] | []>> {
    const postsCount: number = await this.getPostsCount(blogId);
    const pagesCount: number =
      postsCount && pageSize ? Math.ceil(postsCount / pageSize) : 0;
    const postsToSkip = (pageNumber - 1) * pageSize;

    const query = PostModelDb.find();
    if (blogId) query.where("blogId", blogId);

    const posts: PostRepViewModel[] | [] = await query
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(postsToSkip)
      .limit(pageSize)
      .lean();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: this.mapPosts(posts),
    };
  }

  async getPostById(id: string): Promise<TPostControllerViewModel | null> {
    if (!ObjectId.isValid(id)) return null;

    const post: PostRepViewModel | null = await PostModelDb.findById(
      new ObjectId(id)
    ).lean();

    return post ? this.mapPost(post) : null;
  }
}

export default PostsQueryRepository;
