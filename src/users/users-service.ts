import { ObjectId } from "mongodb";
import { TFieldError } from "../types/types";
import bcrypt from "bcryptjs";
import TUserServiceInputModel from "./models/UserServiceInputModel";
import usersQueryRepository from "./users-query-repository";
import TUserRepViewModel from "./models/UserRepViewModel";
import usersRepository from "./users-repository";

type TCreateUserReturnedValue = {
  hasError: boolean;
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
        hasError: true,
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
      hasError: false,
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
  }): Promise<{ user: TUserRepViewModel | null; hasError: boolean }> => {
    const user: TUserRepViewModel | null =
      await usersQueryRepository.getByLoginOrEmail(loginOrEmail);
    if (!user) return { user: null, hasError: true };

    const is_correct = await bcrypt.compare(password, user.passwordHash);

    return { user: is_correct ? user : null, hasError: !is_correct };
  },

  _generateHash: async ({ value, salt }: { value: string; salt: string }) =>
    await bcrypt.hash(value, salt),
};

export default usersService;
