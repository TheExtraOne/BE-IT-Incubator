import blogsRepository from "../data-access/command-repository/blogs-repository";
import { TBlogRepViewModel } from "../data-access/models";
import { TBlogServiceInputModel } from "./models";
import { ObjectId } from "mongodb";

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
