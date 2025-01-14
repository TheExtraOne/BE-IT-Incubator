import { ObjectId } from "mongodb";
import { SORT_DIRECTION } from "../../settings";
import { TSortDirection } from "../../types";
import { blogCollection } from "../db";
import { TBlogRepViewModel } from "../models";

const blogsQueryRepository = {
  getBlogsCount: async (searchNameTerm: string | null): Promise<number> => {
    const filter: Record<string, RegExp> | Record<string, never> = {};
    if (searchNameTerm) filter.name = new RegExp(searchNameTerm, "i");

    return await blogCollection.countDocuments(filter);
  },

  getAllBlogs: async ({
    searchNameTerm,
    blogsToSkip,
    pageSize,
    sortBy,
    sortDirection,
  }: {
    searchNameTerm: string | null;
    blogsToSkip: number;
    pageSize: number;
    sortBy: string;
    sortDirection: TSortDirection;
  }): Promise<TBlogRepViewModel[] | []> => {
    const filter: Record<string, RegExp> | Record<string, never> = {};
    if (searchNameTerm) filter.name = new RegExp(searchNameTerm, "i");

    return await blogCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(blogsToSkip)
      .limit(pageSize)
      .toArray();
  },

  getBlogById: async (id: string): Promise<TBlogRepViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    const blog: TBlogRepViewModel | null = await blogCollection.findOne({
      _id: new ObjectId(id),
    });

    return blog;
  },
};

export default blogsQueryRepository;
