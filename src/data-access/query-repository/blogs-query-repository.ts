import { ObjectId } from "mongodb";
import { SORT_DIRECTION } from "../../settings";
import { TResponseWithPagination, TSortDirection } from "../../types";
import { blogCollection } from "../db";
import { TBlogRepViewModel } from "../models";
import { TBlogControllerViewModel } from "../../api/models";

const mapBlog = (blog: TBlogRepViewModel): TBlogControllerViewModel => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});

const mapBlogs = (
  blogs: TBlogRepViewModel[] | []
): TBlogControllerViewModel[] => blogs.map(mapBlog);

const blogsQueryRepository = {
  getBlogsCount: async (searchNameTerm: string | null): Promise<number> => {
    const filter: Record<string, RegExp> | Record<string, never> = {};
    if (searchNameTerm) filter.name = new RegExp(searchNameTerm, "i");

    return await blogCollection.countDocuments(filter);
  },

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
  }): Promise<TResponseWithPagination<TBlogControllerViewModel[] | []>> => {
    // Filtration
    const filter: Record<string, RegExp> | Record<string, never> = {};
    if (searchNameTerm) filter.name = new RegExp(searchNameTerm, "i");

    // Pagination
    const blogsCount = await blogsQueryRepository.getBlogsCount(searchNameTerm);
    const pagesCount =
      blogsCount && pageSize ? Math.ceil(blogsCount / pageSize) : 0;
    const blogsToSkip = (pageNumber - 1) * pageSize;

    const blogs: TBlogRepViewModel[] | [] = await blogCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(blogsToSkip)
      .limit(pageSize)
      .toArray();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: mapBlogs(blogs),
    };
  },

  getBlogById: async (id: string): Promise<TBlogControllerViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    const blog: TBlogRepViewModel | null = await blogCollection.findOne({
      _id: new ObjectId(id),
    });

    return blog ? mapBlog(blog) : null;
  },
};

export default blogsQueryRepository;
