import { ObjectId } from "mongodb";
import { SORT_DIRECTION } from "../../settings";
import { TSortDirection } from "../../types";
import { postCollection } from "../db";
import TPostRepViewModel from "../models/PostRepViewModel";

const postsQueryRepository = {
  getPostsCount: async (
    filter: Record<string, string> | undefined = {}
  ): Promise<number> => await postCollection.countDocuments(filter),

  getAllPosts: async ({
    postsToSkip,
    pageSize,
    sortBy,
    sortDirection,
    filter = {},
  }: {
    filter?: Record<string, string>;
    postsToSkip: number;
    pageSize: number;
    sortBy: string;
    sortDirection: TSortDirection;
  }): Promise<TPostRepViewModel[] | []> =>
    await postCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(postsToSkip)
      .limit(pageSize)
      .toArray(),

  getPostById: async (id: string): Promise<TPostRepViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    return await postCollection.findOne({ _id: new ObjectId(id) });
  },
};

export default postsQueryRepository;
