import { postCollection, blogCollection } from "./db";
import TPostDbViewModel from "./models/PostDbViewModel";
import TPostRepViewModel from "./models/PostRepViewModel";

const mapPost = (post: TPostDbViewModel): TPostRepViewModel => ({
  id: post.id,
  title: post.title,
  shortDescription: post.shortDescription,
  content: post.content,
  blogId: post.blogId,
  blogName: post.blogName,
  createdAt: post.createdAt,
});

const mapPosts = (posts: TPostDbViewModel[]): TPostRepViewModel[] =>
  posts.map(mapPost);

const postsRepository = {
  getAllPosts: async (): Promise<TPostRepViewModel[]> => {
    const posts = await postCollection.find({}).toArray();

    return mapPosts(posts);
  },
  getPostById: async (id: string): Promise<TPostRepViewModel | null> => {
    const post = await postCollection.findOne({ id });

    return post ? mapPost(post) : null;
  },
  createPost: async (
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Promise<TPostRepViewModel | null> => {
    const blog = await blogCollection.findOne({ id: blogId });
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
    await postCollection.insertOne(newPost);

    return mapPost(newPost);
  },
  updatePostById: async (
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ): Promise<boolean> => {
    const { matchedCount } = await postCollection.updateOne(
      { id },
      { $set: { title, shortDescription, content, blogId } }
    );

    return !!matchedCount;
  },
  deletePostById: async (id: string): Promise<boolean> => {
    const { deletedCount } = await postCollection.deleteOne({ id });

    return !!deletedCount;
  },
};

export default postsRepository;
