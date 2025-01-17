import { TUserRepViewModel } from "../data-access/models";
import { TUserServiceInputModel } from "./models";
import { ObjectId } from "mongodb";
import usersRepository from "../data-access/command-repository/users-repository";
import usersQueryRepository from "../data-access/query-repository/users-query-repository";
import { TFieldError } from "../types";
import bcrypt from "bcryptjs";

type TCreateUserReturnedValue = {
  has_error: boolean;
  errors: TFieldError[] | [];
  createdUserId: null | string;
};

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
        createdUserId: null,
      };
    }

    const newUser: TUserRepViewModel = {
      _id: new ObjectId(),
      login,
      passwordHash,
      email,
      createdAt: new Date().toISOString(),
    };
    const createdUserId: string = await usersRepository.createUser(newUser);

    return {
      has_error: false,
      errors,
      createdUserId,
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
