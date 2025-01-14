import blogsRepository from "../repository/blogs-db-repository";
import TBlogRepViewModel from "../repository/models/BlogRepViewModel";
import TBlogViewModel from "./models/BlogViewModel";
import { TPages, TResponseWithPagination, TSorting } from "../types";

type TSearchParam = { searchNameTerm: string | null };

const mapBlog = (blog: TBlogRepViewModel): TBlogViewModel => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});

const mapBlogs = (blogs: TBlogRepViewModel[] | []): TBlogViewModel[] =>
  blogs.map(mapBlog);

const blogsService = {
  getAllBlogs: async ({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: TSearchParam & TPages & TSorting): Promise<
    TResponseWithPagination<TBlogViewModel[] | []>
  > => {
    const blogsCount = await blogsRepository.getBlogsCount(searchNameTerm);
    const pagesCount =
      blogsCount && pageSize ? Math.ceil(blogsCount / pageSize) : 0;
    const blogsToSkip = (pageNumber - 1) * pageSize;
    const blogs: [] | TBlogRepViewModel[] = await blogsRepository.getAllBlogs({
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

  getBlogById: async (id: string): Promise<TBlogViewModel | null> => {
    const blog: TBlogRepViewModel | null = await blogsRepository.getBlogById(
      id
    );

    return blog ? mapBlog(blog) : null;
  },

  createBlog: async ({
    name,
    description,
    websiteUrl,
  }: {
    name: string;
    description: string;
    websiteUrl: string;
  }): Promise<TBlogViewModel | null> => {
    const newBlog: Omit<TBlogViewModel, "id"> = {
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    const insertedId = await blogsRepository.createBlog(newBlog);
    const createdBlog = await blogsService.getBlogById(insertedId);

    return createdBlog;
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
