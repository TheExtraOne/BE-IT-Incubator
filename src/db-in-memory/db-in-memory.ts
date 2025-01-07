import TBlogViewModel from "../models/BlogViewModel";
import TPostViewModel from "../models/PostViewModel";

type TDB = {
  blogs: TBlogViewModel[];
  posts: TPostViewModel[];
};

const db: TDB = {
  // blogs: [
    // {
    //   id: "1",
    //   name: "Blog 1 name",
    //   description: "Blog 1 description",
    //   websiteUrl: "https://doka.guide/js",
    // },
    // {
    //   id: "2",
    //   name: "Blog 2 name",
    //   description: "Blog 2 description",
    //   websiteUrl: "https://javascript.info/",
    // },
  // ],
  // posts: [
    // {
    //   id: "1",
    //   title: "Post 1 title",
    //   shortDescription: "Post 1 shortDescription",
    //   content: "Post 1 content",
    //   blogId: "1",
    //   blogName: "Blog 1 name",
    // },
    // {
    //   id: "2",
    //   title: "Post 2 title",
    //   shortDescription: "Post 2 shortDescription",
    //   content: "Post 2 content",
    //   blogId: "1",
    //   blogName: "Blog 1 name",
    // },
    // {
    //   id: "3",
    //   title: "Post 3 title",
    //   shortDescription: "Post 3 shortDescription",
    //   content: "Post 3 content",
    //   blogId: "2",
    //   blogName: "Blog 2 name",
    // },
  // ],
  blogs: [],
  posts: [],
};

export const resetPostsDB = (posts?: TPostViewModel[]) => {
  if (!posts) {
    db.posts = [];
    return;
  }

  db.posts = posts || db.posts;
};

export const resetBlogsDB = (blogs?: TBlogViewModel[]) => {
  if (!blogs) {
    db.blogs = [];
    return;
  }

  db.blogs = blogs || db.blogs;
};

export default db;
