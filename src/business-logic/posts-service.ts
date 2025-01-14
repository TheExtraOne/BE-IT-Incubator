import { TBlogRepViewModel, TPostRepViewModel } from "../data-access/models";
import postsRepository from "../data-access/command-repository/posts-repository";
import { TPages, TResponseWithPagination, TSorting } from "../types";
import { TPostServiceInputModel, TPostServiceViewModel } from "./models";
import { ObjectId } from "mongodb";
import blogsQueryRepository from "../data-access/query-repository/blogs-query-repository";
import postsQueryRepository from "../data-access/query-repository/posts-query-repository";

const mapPost = (post: TPostRepViewModel): TPostServiceViewModel => ({
  id: post._id.toString(),
  title: post.title,
  shortDescription: post.shortDescription,
  content: post.content,
  blogId: post.blogId,
  blogName: post.blogName,
  createdAt: post.createdAt,
});

const mapPosts = (
  posts: TPostRepViewModel[] | []
): TPostServiceViewModel[] | [] => posts.map(mapPost);

const postsService = {
  getAllPosts: async ({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: TPages & TSorting): Promise<
    TResponseWithPagination<TPostServiceViewModel[] | []>
  > => {
    const postsCount = await postsQueryRepository.getPostsCount();
    const pagesCount =
      postsCount && pageSize ? Math.ceil(postsCount / pageSize) : 0;
    const postsToSkip = (pageNumber - 1) * pageSize;

    const posts: [] | TPostRepViewModel[] =
      await postsQueryRepository.getAllPosts({
        postsToSkip,
        pageSize,
        sortBy,
        sortDirection,
      });

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: mapPosts(posts),
    };
  },

  getPostById: async (id: string): Promise<TPostServiceViewModel | null> => {
    const post: TPostRepViewModel | null =
      await postsQueryRepository.getPostById(id);

    return post ? mapPost(post) : null;
  },

  getAllPostsForBlogById: async ({
    blogId,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: {
    blogId: string;
  } & TPages &
    TSorting): Promise<
    TResponseWithPagination<TPostServiceViewModel[] | []>
  > => {
    const postsCount = await postsQueryRepository.getPostsCount({ blogId });
    const pagesCount =
      postsCount && pageSize ? Math.ceil(postsCount / pageSize) : 0;
    const postsToSkip = (pageNumber - 1) * pageSize;

    const posts: [] | TPostRepViewModel[] =
      await postsQueryRepository.getAllPosts({
        postsToSkip,
        pageSize,
        sortBy,
        sortDirection,
        filter: { blogId },
      });

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: postsCount,
      items: mapPosts(posts),
    };
  },

  checkIfBlogIdExist: async (blogId: string) => {
    const blog: TBlogRepViewModel | null =
      await blogsQueryRepository.getBlogById(blogId);
    return !!blog;
  },

  createPost: async ({
    title,
    shortDescription,
    content,
    blogId,
  }: TPostServiceInputModel): Promise<TPostServiceViewModel | null> => {
    const blog: TBlogRepViewModel | null =
      await blogsQueryRepository.getBlogById(blogId);
    if (!blog) return null;

    const newPost: TPostRepViewModel = {
      _id: new ObjectId(),
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };
    await postsRepository.createPost(newPost);

    return mapPost(newPost);
  },

  updatePostById: async ({
    id,
    title,
    shortDescription,
    content,
    blogId,
  }: {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
  }): Promise<boolean> =>
    await postsRepository.updatePostById({
      id,
      title,
      shortDescription,
      content,
      blogId,
    }),

  deletePostById: async (id: string): Promise<boolean> =>
    await postsRepository.deletePostById(id),
};

export default postsService;
