import { ObjectId } from "mongodb";
import { Result, TExtension } from "../common/types/types";
import bcrypt from "bcryptjs";
import TUserServiceInputModel from "./models/UserServiceInputModel";
import TUserRepViewModel from "./models/UserRepViewModel";
import usersRepository from "./users-repository";
import { RESULT_STATUS } from "../common/settings";

const usersService = {
  checkIsLoginUnique: async (login: string): Promise<boolean> => {
    return await usersRepository.isUniqueInDatabase({
      fieldName: "login",
      fieldValue: login,
    });
  },

  checkIsEmailUnique: async (email: string): Promise<boolean> => {
    return await usersRepository.isUniqueInDatabase({
      fieldName: "email",
      fieldValue: email,
    });
  },

  checkIfFieldIsUnique: async ({
    email,
    login,
  }: {
    email: string | null;
    login: string | null;
  }): Promise<TExtension[] | []> => {
    const errors: TExtension[] = [];
    if (login) {
      const isLoginUnique = await usersService.checkIsLoginUnique(login);
      !isLoginUnique &&
        errors.push({
          message: "Login already exists",
          field: "login",
        });
    }
    if (email) {
      const isEmailUnique = await usersService.checkIsEmailUnique(email);
      !isEmailUnique &&
        errors.push({
          message: "Email already exists",
          field: "email",
        });
    }

    return errors;
  },

  createUser: async ({
    login,
    password,
    email,
  }: TUserServiceInputModel): Promise<Result<string | null>> => {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await usersService._generateHash({
      value: password,
      salt: passwordSalt,
    });

    const errors = await usersService.checkIfFieldIsUnique({
      login,
      email,
    });
    if (errors.length) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Bad request",
        extensions: [...errors],
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
      status: RESULT_STATUS.SUCCESS,
      data: createdUserId,
      extensions: [],
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
  }): Promise<Result<TUserRepViewModel | null>> => {
    const user: TUserRepViewModel | null =
      await usersRepository.getByLoginOrEmail(loginOrEmail);

    if (!user) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "loginOrEmail", message: "Not Found" }],
      };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Bad Request",
        extensions: [{ field: "password", message: "Wrong password" }],
      };
    }

    return {
      status: RESULT_STATUS.SUCCESS,
      data: user,
      extensions: [],
    };
  },

  _generateHash: async ({ value, salt }: { value: string; salt: string }) =>
    await bcrypt.hash(value, salt),
};

export default usersService;
