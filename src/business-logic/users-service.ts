import { TUserRepViewModel } from "../data-access/models";
import { TUserServiceInputModel, TUserServiceViewModel } from "./models";
import { ObjectId } from "mongodb";
import usersRepository from "../data-access/command-repository/users-repository";
import usersQueryRepository from "../data-access/query-repository/users-query-repository";

const mapUser = (user: TUserRepViewModel): TUserServiceViewModel => ({
  id: user._id.toString(),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
});

const mapUsers = (users: TUserRepViewModel[] | []): TUserServiceViewModel[] =>
  users.map(mapUser);

const usersService = {
  getAllUsers: async (): Promise<TUserServiceViewModel[] | []> => {
    const users: TUserRepViewModel[] | [] =
      await usersQueryRepository.getAllUsers();

    return mapUsers(users);
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

  deleteUserById: async (id: string): Promise<boolean> =>
    await usersRepository.deleteUserById(id),
};

export default usersService;
