import { blogCollection } from "./db";
import TBlogViewModel from "../models/BlogViewModel";

const blogsRepository = {
  getAllBlogs: async (): Promise<TBlogViewModel[]> => {
    const blogs = await blogCollection.find({}).toArray();

    return blogs.map((blog) => ({
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    }));
  },
  getBlogById: async (id: string): Promise<TBlogViewModel | null> => {
    const blog: TBlogViewModel | null = await blogCollection.findOne({ id });

    return blog
      ? {
          id: blog.id,
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt,
          isMembership: blog.isMembership,
        }
      : null;
  },
  createBlog: async (
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<TBlogViewModel> => {
    const newBlog = {
      id: `${Date.now() + Math.random()}`,
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    await blogCollection.insertOne(newBlog);

    return {
      id: newBlog.id,
      name,
      description,
      websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership,
    };
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
