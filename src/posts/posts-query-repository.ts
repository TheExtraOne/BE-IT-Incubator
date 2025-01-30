import { ObjectId } from "mongodb";
import TPostRepViewModel from "./models/PostRepViewModel";
import TPostControllerViewModel from "./models/PostControllerViewModel";
import { PostModelClass } from "../db/db";
import { TResponseWithPagination, TSortDirection } from "../common/types/types";
import { SORT_DIRECTION } from "../common/settings";

const mapPost = (post: TPostRepViewModel): TPostControllerViewModel => ({
  id: post._id.toString(),
  title: post.title,
  shortDescription: post.shortDescription,
  content: post.content,
  blogId: post.blogId,
  blogName: post.blogName,
  createdAt: post.createdAt,
});

const mapPosts = (
  posts: TPostRepViewModel[] | []
): TPostControllerViewModel[] | [] => posts.map(mapPost);

const postsQueryRepository = {
  _getPostsCount: async (blogId: string | null): Promise<number> => {
    const query = PostModelClass.countDocuments();
    if (blogId) query.where("blogId", blogId);

    return await query;
  },

  getAllPosts: async ({
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
    sortDirection: TSortDirection;
  }): Promise<TResponseWithPagination<TPostControllerViewModel[] | []>> => {
    const postsCount: number = await postsQueryRepository._getPostsCount(
      blogId
    );
    const pagesCount: number =
      postsCount && pageSize ? Math.ceil(postsCount / pageSize) : 0;
    const postsToSkip = (pageNumber - 1) * pageSize;

    const query = PostModelClass.find();
    if (blogId) query.where("blogId", blogId);

    const posts: TPostRepViewModel[] | [] = await query
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(postsToSkip)
      .limit(pageSize)
      .lean();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: mapPosts(posts),
    };
  },

  getPostById: async (id: string): Promise<TPostControllerViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    const post: TPostRepViewModel | null = await PostModelClass.findById(
      new ObjectId(id)
    ).lean();

    return post ? mapPost(post) : null;
  },
};

export default postsQueryRepository;
