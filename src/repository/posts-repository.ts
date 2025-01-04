import db from "../db/db";
import blogsRepository from "./blogs-repository";

const postsRepository = {
  getAllPosts: () => db.posts,
  getPostById: (id: string) => {
    const post = db.posts.find((post) => post.id === id);

    return post
      ? {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
        }
      : null;
  },
  createPost: (
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ) => {
    const { name } = blogsRepository.getBlogById(blogId) ?? {};
    if (!name) return null;

    const newPost = {
      id: `${Date.now() + Math.random()}`,
      title,
      shortDescription,
      content,
      blogId,
      blogName: name,
    };
    db.posts = [...db.posts, newPost];

    return newPost;
  },

  updatePostById: (
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ) => {
    const postIndex = db.posts.findIndex((post) => post.id === id);
    if (postIndex < 0) return { success: false };

    db.posts[postIndex] = {
      ...db.posts[postIndex],
      title,
      shortDescription,
      content,
      blogId,
    };

    return { success: true };
  },
};

export default postsRepository;
