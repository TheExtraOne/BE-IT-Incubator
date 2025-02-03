import { ObjectId } from "mongodb";
import BlogRepViewModel from "./models/BlogRepViewModel";
import TBlogControllerViewModel from "./models/BlogControllerViewModel";
import { BlogModelDb } from "../db/db";
import { SORT_DIRECTION } from "../common/settings";
import { TResponseWithPagination } from "../common/types/types";

class BlogsQueryRepository {
  private mapBlog(blog: BlogRepViewModel): TBlogControllerViewModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  private mapBlogs(blogs: BlogRepViewModel[] | []): TBlogControllerViewModel[] {
    return blogs.map(this.mapBlog);
  }

  private async getBlogsCount(searchNameTerm: string | null): Promise<number> {
    const query = BlogModelDb.countDocuments();
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
    sortDirection: SORT_DIRECTION;
  }): Promise<TResponseWithPagination<TBlogControllerViewModel[] | []>> {
    // Pagination
    const blogsCount: number = await this.getBlogsCount(searchNameTerm);
    const pagesCount: number =
      blogsCount && pageSize ? Math.ceil(blogsCount / pageSize) : 0;
    const blogsToSkip = (pageNumber - 1) * pageSize;

    const query = BlogModelDb.find();
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
      items: this.mapBlogs(blogs),
    };
  }

  async getBlogById(id: string): Promise<TBlogControllerViewModel | null> {
    if (!ObjectId.isValid(id)) return null;

    const blog: BlogRepViewModel | null = await BlogModelDb.findById(
      new ObjectId(id)
    ).lean();

    return blog ? this.mapBlog(blog) : null;
  }
}

export default BlogsQueryRepository;
