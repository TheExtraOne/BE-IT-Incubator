import { blogCollection } from "./db";
import TBlogDbViewModel from "./models/BlogDbViewModel";
import TBlogRepViewModel from "./models/BlogRepViewModel";

const mapBlog = (blog: TBlogDbViewModel): TBlogRepViewModel => ({
  id: blog.id,
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});

const mapBlogs = (blogs: TBlogDbViewModel[]): TBlogRepViewModel[] =>
  blogs.map(mapBlog);

const blogsRepository = {
  getAllBlogs: async (): Promise<TBlogRepViewModel[]> => {
    const blogs = await blogCollection.find({}).toArray();

    return mapBlogs(blogs);
  },
  getBlogById: async (id: string): Promise<TBlogRepViewModel | null> => {
    const blog: TBlogRepViewModel | null = await blogCollection.findOne({ id });

    return blog ? mapBlog(blog) : null;
  },
  createBlog: async (
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<TBlogRepViewModel> => {
    const newBlog: TBlogRepViewModel = {
      id: `${Date.now() + Math.random()}`,
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    await blogCollection.insertOne(newBlog);

    return mapBlog(newBlog);
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
