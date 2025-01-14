import { TUserRepViewModel } from "../data-access/models";
import { TUserServiceInputModel, TUserServiceViewModel } from "./models";
import { ObjectId } from "mongodb";
import usersRepository from "../data-access/command-repository/users-repository";

const mapUser = (user: TUserRepViewModel): TUserServiceViewModel => ({
  id: user._id.toString(),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
});

// const mapBlogs = (blogs: TBlogRepViewModel[] | []): TBlogServiceViewModel[] =>
//   blogs.map(mapBlog);

const usersService = {
  getAllUsers: async () => {
    // TODO
  },

  createUser: async ({
    login,
    password,
    email,
  }: TUserServiceInputModel): Promise<TUserServiceViewModel> => {
    const newUser: TUserRepViewModel = {
      _id: new ObjectId(),
      login,
      password,
      email,
      createdAt: new Date().toISOString(),
    };
    await usersRepository.createUser(newUser);

    return mapUser(newUser);
  },

  deleteUserById: async (id: string) => {
    // TODO
    // await blogsRepository.deleteBlogById(id),
  },
};

export default usersService;
