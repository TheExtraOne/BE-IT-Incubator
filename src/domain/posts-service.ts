import blogsRepository from "../repository/blogs-db-repository";
import TBlogRepViewModel from "../repository/models/BlogRepViewModel";
import TPostRepViewModel from "../repository/models/PostRepViewModel";
import postsRepository from "../repository/posts-db-repository";
import { TPages, TResponseWithPagination, TSorting } from "../types";
import TPostViewModel from "./models/PostViewModel";

const mapPost = (post: TPostRepViewModel): TPostViewModel => ({
  id: post.id,
  title: post.title,
  shortDescription: post.shortDescription,
  content: post.content,
  blogId: post.blogId,
  blogName: post.blogName,
  createdAt: post.createdAt,
});

const mapPosts = (posts: TPostRepViewModel[] | []): TPostViewModel[] | [] =>
  posts.map(mapPost);

const postsService = {
  getAllPosts: async ({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: TPages & TSorting): Promise<
    TResponseWithPagination<TPostViewModel[] | []>
  > => {
    const postsCount = await postsRepository.getPostsCount();
    const pagesCount =
      postsCount && pageSize ? Math.ceil(postsCount / pageSize) : 0;
    const postsToSkip = (pageNumber - 1) * pageSize;

    const posts: [] | TPostRepViewModel[] = await postsRepository.getAllPosts({
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

  getPostById: async (id: string): Promise<TPostViewModel | null> => {
    const post: TPostRepViewModel | null = await postsRepository.getPostById(
      id
    );

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
    TSorting): Promise<TResponseWithPagination<TPostViewModel[] | []>> => {
    const postsCount = await postsRepository.getPostsCount({ blogId });
    const pagesCount =
      postsCount && pageSize ? Math.ceil(postsCount / pageSize) : 0;
    const postsToSkip = (pageNumber - 1) * pageSize;

    const posts: [] | TPostRepViewModel[] = await postsRepository.getAllPosts({
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

  checkIfBlogIdCorrect: async (blogId: string) => {
    const blog: TBlogRepViewModel | null = await blogsRepository.getBlogById(
      blogId
    );
    return !!blog;
  },

  createPost: async ({
    title,
    shortDescription,
    content,
    blogId,
  }: {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
  }): Promise<TPostViewModel | null> => {
    const blog: TBlogRepViewModel | null = await blogsRepository.getBlogById(
      blogId
    );
    if (!blog) return null;

    const newPost = {
      id: `${Date.now() + Math.random()}`,
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };
    const createdPost: TPostRepViewModel = await postsRepository.createPost(
      newPost
    );

    return mapPost(createdPost);
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
