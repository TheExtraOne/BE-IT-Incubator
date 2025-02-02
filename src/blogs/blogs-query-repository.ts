import { ObjectId } from "mongodb";
import BlogRepViewModel from "./models/BlogRepViewModel";
import TBlogControllerViewModel from "./models/BlogControllerViewModel";
import { BlogModelMongoose } from "../db/db";
import { SORT_DIRECTION } from "../common/settings";
import { TResponseWithPagination, TSortDirection } from "../common/types/types";

const mapBlog = (blog: BlogRepViewModel): TBlogControllerViewModel => ({
  id: blog._id.toString(),
  name: blog.name,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});

const mapBlogs = (blogs: BlogRepViewModel[] | []): TBlogControllerViewModel[] =>
  blogs.map(mapBlog);

class BlogsQueryRepository {
  private async getBlogsCount(searchNameTerm: string | null): Promise<number> {
    const query = BlogModelMongoose.countDocuments();
    if (searchNameTerm) query.where("name", new RegExp(searchNameTerm, "i"));

    return await query;
  }

  async getAllBlogs({
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
  }): Promise<TResponseWithPagination<TBlogControllerViewModel[] | []>> {
    // Pagination
    const blogsCount: number = await this.getBlogsCount(searchNameTerm);
    const pagesCount: number =
      blogsCount && pageSize ? Math.ceil(blogsCount / pageSize) : 0;
    const blogsToSkip = (pageNumber - 1) * pageSize;

    const query = BlogModelMongoose.find();
    if (searchNameTerm) query.where("name", new RegExp(searchNameTerm, "i"));

    const blogs: BlogRepViewModel[] | [] = await query
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(blogsToSkip)
      .limit(pageSize)
      .lean();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: blogsCount,
      items: mapBlogs(blogs),
    };
  }

  async getBlogById(id: string): Promise<TBlogControllerViewModel | null> {
    if (!ObjectId.isValid(id)) return null;

    const blog: BlogRepViewModel | null = await BlogModelMongoose.findById(
      new ObjectId(id)
    ).lean();

    return blog ? mapBlog(blog) : null;
  }
}

export default new BlogsQueryRepository();
