import blogsRepository from "../data-access/command-repository/blogs-repository";
import blogsQueryRepository from "../data-access/query-repository/blogs-query-repository";
import { TResponseWithPagination, TSortDirection } from "../types";
import { TBlogRepViewModel } from "../data-access/models";
import { TBlogServiceInputModel, TBlogServiceViewModel } from "./models";
import { ObjectId } from "mongodb";

const mapBlog = (blog: TBlogRepViewModel): TBlogServiceViewModel => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});

const mapBlogs = (blogs: TBlogRepViewModel[] | []): TBlogServiceViewModel[] =>
  blogs.map(mapBlog);

const blogsService = {
  getAllBlogs: async ({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: {
    searchNameTerm: string | null;
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: TSortDirection;
  }): Promise<TResponseWithPagination<TBlogServiceViewModel[] | []>> => {
    const blogsCount = await blogsQueryRepository.getBlogsCount(searchNameTerm);
    const pagesCount =
      blogsCount && pageSize ? Math.ceil(blogsCount / pageSize) : 0;
    const blogsToSkip = (pageNumber - 1) * pageSize;
    const blogs: [] | TBlogRepViewModel[] =
      await blogsQueryRepository.getAllBlogs({
        searchNameTerm,
        blogsToSkip,
        pageSize,
        sortBy,
        sortDirection,
      });

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: mapBlogs(blogs),
    };
  },

  getBlogById: async (id: string): Promise<TBlogServiceViewModel | null> => {
    const blog: TBlogRepViewModel | null =
      await blogsQueryRepository.getBlogById(id);

    return blog ? mapBlog(blog) : null;
  },

  createBlog: async ({
    name,
    description,
    websiteUrl,
  }: TBlogServiceInputModel): Promise<TBlogServiceViewModel> => {
    const newBlog: TBlogRepViewModel = {
      _id: new ObjectId(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    await blogsRepository.createBlog(newBlog);

    return mapBlog(newBlog);
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
  }): Promise<boolean> =>
    await blogsRepository.updateBlogById({ id, name, description, websiteUrl }),

  deleteBlogById: async (id: string): Promise<boolean> =>
    await blogsRepository.deleteBlogById(id),
};

export default blogsService;
