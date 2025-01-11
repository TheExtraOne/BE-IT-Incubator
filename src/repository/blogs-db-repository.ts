import { blogCollection } from "./db";
import TBlogRepViewModel from "./models/BlogRepViewModel";

type TNewBlog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

const blogsRepository = {
  getBlogsCount: async (): Promise<number> => {
    return await blogCollection.count({});
  },

  getAllBlogs: async (
    searchNameTerm: string | null,
    blogsToSkip: number,
    pageSize: number
  ): Promise<TBlogRepViewModel[] | []> => {
    const filter: Record<string, RegExp> | Record<string, never> = {};
    if (searchNameTerm) filter.name = new RegExp(searchNameTerm, "i");

    return await blogCollection
      .find(filter)
      .skip(blogsToSkip)
      .limit(pageSize)
      .toArray();
  },

  getBlogById: async (id: string): Promise<TBlogRepViewModel | null> => {
    const blog: TBlogRepViewModel | null = await blogCollection.findOne({ id });

    return blog;
  },

  createBlog: async (newBlog: TNewBlog): Promise<TBlogRepViewModel> => {
    await blogCollection.insertOne(newBlog);

    return newBlog;
  },

  updateBlogById: async (
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<boolean> => {
    const { matchedCount } = await blogCollection.updateOne(
      { id },
      { $set: { name, description, websiteUrl } }
    );

    return !!matchedCount;
  },

  deleteBlogById: async (id: string): Promise<boolean> => {
    const { deletedCount } = await blogCollection.deleteOne({ id });

    return !!deletedCount;
  },
};

export default blogsRepository;
