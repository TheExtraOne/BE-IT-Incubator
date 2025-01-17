import { ObjectId } from "mongodb";
import TBlogServiceInputModel from "./models/BlogServiceInputModel";
import blogsRepository from "./blogs-repository";
import TBlogRepViewModel from "./models/BlogRepViewModel";

const blogsService = {
  createBlog: async ({
    name,
    description,
    websiteUrl,
  }: TBlogServiceInputModel): Promise<string> => {
    const newBlog: TBlogRepViewModel = {
      _id: new ObjectId(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    return await blogsRepository.createBlog(newBlog);
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
  }): Promise<boolean> =>
    await blogsRepository.updateBlogById({ id, name, description, websiteUrl }),

  deleteBlogById: async (id: string): Promise<boolean> =>
    await blogsRepository.deleteBlogById(id),
};

export default blogsService;
