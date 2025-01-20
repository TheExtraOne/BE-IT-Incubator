import { ObjectId } from "mongodb";
import TBlogRepViewModel from "./models/BlogRepViewModel";
import { blogCollection } from "../db/db";

const blogsRepository = {
  getBlogById: async (id: string): Promise<TBlogRepViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    const blog: TBlogRepViewModel | null = await blogCollection.findOne({
      _id: new ObjectId(id),
    });

    return blog;
  },

  createBlog: async (newBlog: TBlogRepViewModel): Promise<string> => {
    const { insertedId } = await blogCollection.insertOne(newBlog);

    return insertedId.toString();
  },

  updateBlogById: async ({
    id,
    name,
    description,
    websiteUrl,
  }: {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
  }): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { matchedCount } = await blogCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, description, websiteUrl } }
    );

    return !!matchedCount;
  },

  deleteBlogById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await blogCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return !!deletedCount;
  },
};

export default blogsRepository;
