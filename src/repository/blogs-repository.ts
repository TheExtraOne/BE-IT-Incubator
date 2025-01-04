import db from "../db/db";

const blogsRepository = {
  getAllBlogs: () => db.blogs,
  getBlogById: (id: string) => {
    const blog = db.blogs.find((blog) => blog.id === id);

    return blog
      ? {
          id: blog.id,
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
        }
      : null;
  },
  createBlog: (name: string, description: string, websiteUrl: string) => {
    const newBlog = {
      id: `${Date.now() + Math.random()}`,
      name,
      description,
      websiteUrl,
    };
    db.blogs = [...db.blogs, newBlog];

    return newBlog;
  },
  getBlogIndexById: (id: string) =>
    db.blogs.findIndex((blog) => blog.id === id),
  updateBlogById: (
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ) => {
    const blogIndex = blogsRepository.getBlogIndexById(id);
    if (blogIndex < 0) return { success: false };

    db.blogs[blogIndex] = {
      ...db.blogs[blogIndex],
      name,
      description,
      websiteUrl,
    };

    return { success: true };
  },
  deleteBlogById: (id: string) => {
    const blogIndex = blogsRepository.getBlogIndexById(id);
    if (blogIndex < 0) return { success: false };

    const newBlogs = db.blogs.filter((blog) => blog.id !== id);
    db.blogs = newBlogs;
    return { success: true };
  },
};

export default blogsRepository;
