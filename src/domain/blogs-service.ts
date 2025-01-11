import blogsRepository from "../repository/blogs-db-repository";
import TBlogRepViewModel from "../repository/models/BlogRepViewModel";
import { blogCollection } from "../repository/db";
import TBlogViewModel from "./models/BlogViewModel";

const mapBlog = (blog: TBlogRepViewModel): TBlogViewModel => ({
  id: blog.id,
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});

const mapBlogs = (blogs: TBlogRepViewModel[] | []): TBlogViewModel[] =>
  blogs.map(mapBlog);

const blogsService = {
  getAllBlogs: async (
    searchNameTerm: string | null
  ): Promise<TBlogViewModel[] | []> => {
    const blogs: [] | TBlogRepViewModel[] = await blogsRepository.getAllBlogs(
      searchNameTerm
    );

    return mapBlogs(blogs);
  },

  getBlogById: async (id: string): Promise<TBlogViewModel | null> => {
    const blog: TBlogRepViewModel | null = await blogsRepository.getBlogById(
      id
    );

    return blog ? mapBlog(blog) : null;
  },

  createBlog: async (
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<TBlogViewModel> => {
    const newBlog: TBlogViewModel = {
      id: `${Date.now() + Math.random()}`,
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    const createdBlog = await blogsRepository.createBlog(newBlog);

    return mapBlog(createdBlog);
  },

  updateBlogById: async (
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ): Promise<boolean> =>
    await blogsRepository.updateBlogById(id, name, description, websiteUrl),

  deleteBlogById: async (id: string): Promise<boolean> =>
    await blogsRepository.deleteBlogById(id),
};

export default blogsService;
