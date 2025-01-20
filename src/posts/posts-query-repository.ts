import { ObjectId } from "mongodb";
import TPostRepViewModel from "./models/PostRepViewModel";
import TPostControllerViewModel from "./models/PostControllerViewModel";
import { postCollection } from "../db/db";
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
  _getPostsCount: async (
    filter: Record<string, string> | undefined = {}
  ): Promise<number> => await postCollection.countDocuments(filter),

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
    let filter: Record<string, string> | Record<string, never> = {};
    if (blogId) filter = { blogId };

    const postsCount = await postsQueryRepository._getPostsCount(filter);
    const pagesCount =
      postsCount && pageSize ? Math.ceil(postsCount / pageSize) : 0;
    const postsToSkip = (pageNumber - 1) * pageSize;

    const posts: TPostRepViewModel[] | [] = await postCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(postsToSkip)
      .limit(pageSize)
      .toArray();

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
    const post: TPostRepViewModel | null = await postCollection.findOne({
      _id: new ObjectId(id),
    });

    return post ? mapPost(post) : null;
  },
};

export default postsQueryRepository;
