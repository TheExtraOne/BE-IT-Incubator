import { ObjectId } from "mongodb";
import TBlogRepViewModel from "./models/BlogRepViewModel";
import { BlogModelClass } from "../db/db";

const blogsRepository = {
  getBlogById: async (id: string) => {
    if (!ObjectId.isValid(id)) return null;
    const blog = await BlogModelClass.findOne({
      _id: new ObjectId(id),
    });

    return blog;
  },

  createBlog: async (newBlog: TBlogRepViewModel): Promise<string> => {
    const blogInstance = new BlogModelClass(newBlog);
    await blogInstance.save();

    return blogInstance._id.toString();
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
    // if (!ObjectId.isValid(id)) return false;
    // const { matchedCount } = await BlogModel.updateOne(
    //   { _id: new ObjectId(id) },
    //   { $set: { name, description, websiteUrl } }
    // );

    // return !!matchedCount;
    const blogInstance = await blogsRepository.getBlogById(id);
    if (!blogInstance) return false;
    blogInstance.name = name;
    blogInstance.description = description;
    blogInstance.websiteUrl = websiteUrl;
    await blogInstance.save();

    return true;
  },

  deleteBlogById: async (id: string): Promise<boolean> => {
    const blogInstance = await blogsRepository.getBlogById(id);
    if (!blogInstance) return false;
    await blogInstance.deleteOne();

    return true;
  },
};

export default blogsRepository;
