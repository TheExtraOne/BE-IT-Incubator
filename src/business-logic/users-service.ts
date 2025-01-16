import { TUserRepViewModel } from "../data-access/models";
import { TUserServiceInputModel, TUserServiceViewModel } from "./models";
import { ObjectId } from "mongodb";
import usersRepository from "../data-access/command-repository/users-repository";
import usersQueryRepository from "../data-access/query-repository/users-query-repository";
import { TFieldError, TResponseWithPagination, TSortDirection } from "../types";
import bcrypt from "bcryptjs";

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
  if (hasLoginError) {
    errors.push({
      message: "Login already exists",
      field: "login",
    });
  }
  if (hasEmailError) {
    errors.push({
      message: "Email already exists",
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
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await usersService._generateHash({
      value: password,
      salt: passwordSalt,
    });

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
      passwordHash,
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

  checkUserCredentials: async ({
    loginOrEmail,
    password,
  }: {
    loginOrEmail: string;
    password: string;
  }): Promise<boolean> => {
    const user: TUserRepViewModel | null =
      await usersQueryRepository.getByLoginOrEmail(loginOrEmail);
    if (!user) return false;

    return bcrypt.compare(password, user.passwordHash);
  },

  _generateHash: async ({ value, salt }: { value: string; salt: string }) =>
    await bcrypt.hash(value, salt),
};

export default usersService;
