import { ObjectId } from "mongodb";
import { SORT_DIRECTION } from "../settings";
import { TSorting } from "../types";
import { blogCollection } from "./db";
import TBlogRepViewModel from "./models/BlogRepViewModel";

type TNewBlog = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};
type TSearchParam = { searchNameTerm: string | null };
type TSkipsLimits = {
  blogsToSkip: number;
  pageSize: number;
};

const blogsRepository = {
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
  }: TSearchParam & TSkipsLimits & TSorting): Promise<
    TBlogRepViewModel[] | []
  > => {
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

  createBlog: async (newBlog: TNewBlog): Promise<string> => {
    const { insertedId } = await blogCollection.insertOne(
      newBlog as TBlogRepViewModel
    );

    return insertedId.toString();
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
  }): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { matchedCount } = await blogCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, description, websiteUrl } }
    );

    return !!matchedCount;
  },

  deleteBlogById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await blogCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return !!deletedCount;
  },
};

export default blogsRepository;
