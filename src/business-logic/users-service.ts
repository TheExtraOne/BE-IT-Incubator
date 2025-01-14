import { TUserRepViewModel } from "../data-access/models";
import { TUserServiceInputModel, TUserServiceViewModel } from "./models";
import { ObjectId } from "mongodb";
import usersRepository from "../data-access/command-repository/users-repository";
import usersQueryRepository from "../data-access/query-repository/users-query-repository";
import { TFieldError, TResponseWithPagination, TSortDirection } from "../types";

type TCreateUserReturnedValue = {
  has_error: boolean;
  errors: TFieldError[] | [];
  createdUser: null | TUserServiceViewModel;
};

const mapUser = (user: TUserRepViewModel): TUserServiceViewModel => ({
  id: user._id.toString(),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
});

const mapUsers = (users: TUserRepViewModel[] | []): TUserServiceViewModel[] =>
  users.map(mapUser);

const formError = ({
  hasLoginError,
  hasEmailError,
}: {
  hasLoginError: boolean;
  hasEmailError: boolean;
}): TFieldError[] | [] => {
  const errors: TFieldError[] = [];
  const message = "Login should be unique";
  if (hasLoginError) {
    errors.push({
      message,
      field: "login",
    });
  }
  if (hasEmailError) {
    errors.push({
      message,
      field: "email",
    });
  }

  return errors;
};

const usersService = {
  getAllUsers: async ({
    searchEmailTerm,
    searchLoginTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: {
    searchEmailTerm: string | null;
    searchLoginTerm: string | null;
    sortBy: string;
    sortDirection: TSortDirection;
    pageNumber: number;
    pageSize: number;
  }): Promise<TResponseWithPagination<TUserServiceViewModel[] | []>> => {
    const usersCount: number = await usersQueryRepository.getUsersCount({
      searchEmailTerm,
      searchLoginTerm,
    });
    const pagesCount =
      usersCount && pageSize ? Math.ceil(usersCount / pageSize) : 0;
    const usersToSkip = (pageNumber - 1) * pageSize;

    const users: TUserRepViewModel[] | [] =
      await usersQueryRepository.getAllUsers({
        searchEmailTerm,
        searchLoginTerm,
        sortBy,
        sortDirection,
        usersToSkip,
        pageSize,
      });

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: usersCount,
      items: mapUsers(users),
    };
  },

  createUser: async ({
    login,
    password,
    email,
  }: TUserServiceInputModel): Promise<TCreateUserReturnedValue> => {
    const isLoginNonUnique: boolean =
      await usersQueryRepository.isUniqueInDatabase({
        fieldName: "login",
        fieldValue: login,
      });
    const isEmailNonUnique: boolean =
      await usersQueryRepository.isUniqueInDatabase({
        fieldName: "email",
        fieldValue: email,
      });
    const errors: TFieldError[] | [] = formError({
      hasEmailError: isEmailNonUnique,
      hasLoginError: isLoginNonUnique,
    });
    if (errors.length) {
      return {
        has_error: true,
        errors,
        createdUser: null,
      };
    }

    const newUser: TUserRepViewModel = {
      _id: new ObjectId(),
      login,
      password,
      email,
      createdAt: new Date().toISOString(),
    };
    await usersRepository.createUser(newUser);

    return {
      has_error: false,
      errors,
      createdUser: mapUser(newUser),
    };
  },

  deleteUserById: async (id: string): Promise<boolean> =>
    await usersRepository.deleteUserById(id),
};

export default usersService;
