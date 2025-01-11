import blogsRepository from "../repository/blogs-db-repository";
import TBlogRepViewModel from "../repository/models/BlogRepViewModel";
import TBlogViewModel from "./models/BlogViewModel";
import { TResponseWithPagination } from "../types";

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
    searchNameTerm: string | null,
    pageNumber: number,
    pageSize: number
  ): Promise<TResponseWithPagination<TBlogViewModel[] | []>> => {
    const blogsCount = await blogsRepository.getBlogsCount();
    const pagesCount =
      blogsCount && pageSize ? Math.ceil(blogsCount / pageSize) : 0;
    const blogsToSkip = (pageNumber - 1) * pageSize;
    const blogs: [] | TBlogRepViewModel[] = await blogsRepository.getAllBlogs(
      searchNameTerm,
      blogsToSkip,
      pageSize
    );

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: mapBlogs(blogs),
    };
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
