import { ObjectId } from "mongodb";
import { blogCollection } from "../db";
import { TBlogRepViewModel } from "../models";

const blogsRepository = {
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
