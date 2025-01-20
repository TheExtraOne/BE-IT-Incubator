import { ObjectId } from "mongodb";
import TBlogRepViewModel from "./models/BlogRepViewModel";
import TBlogControllerViewModel from "./models/BlogControllerViewModel";
import { blogCollection } from "../db/db";
import { SORT_DIRECTION } from "../common/settings";
import { TResponseWithPagination, TSortDirection } from "../common/types/types";

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
  _getBlogsCount: async (searchNameTerm: string | null): Promise<number> => {
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
    const blogsCount = await blogsQueryRepository._getBlogsCount(
      searchNameTerm
    );
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
