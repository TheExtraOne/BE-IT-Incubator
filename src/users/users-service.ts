import { ObjectId } from "mongodb";
import { Result, TExtension } from "../common/types/types";
import TUserServiceInputModel from "./models/UserServiceInputModel";
import usersRepository from "./users-repository";
import { RESULT_STATUS } from "../common/settings";
import TUserAccountRepViewModel from "./models/UserAccountRepViewModel";
import TUserControllerViewModel from "./models/UserControllerViewModel";
import { add } from "date-fns";
import bcryptService from "../adapters/bcypt-service";

const mapUser = (user: TUserAccountRepViewModel): TUserControllerViewModel => ({
  id: user._id.toString(),
  login: user.accountData.userName,
  email: user.accountData.email,
  createdAt: user.accountData.createdAt,
});

const usersService = {
  checkIsLoginUnique: async (login: string): Promise<boolean> => {
    return await usersRepository.isUniqueInDatabase({
      fieldName: "accountData.userName",
      fieldValue: login,
    });
  },

  checkIsEmailUnique: async (email: string): Promise<boolean> => {
    return await usersRepository.isUniqueInDatabase({
      fieldName: "accountData.email",
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
      const isLoginUnique: boolean = await usersService.checkIsLoginUnique(
        login
      );
      !isLoginUnique &&
        errors.push({
          message: "Login already exists",
          field: "login",
        });
    }
    if (email) {
      const isEmailUnique: boolean = await usersService.checkIsEmailUnique(
        email
      );
      !isEmailUnique &&
        errors.push({
          message: "Email already exists",
          field: "email",
        });
    }

    return errors;
  },

  createUserAccount: async ({
    login,
    password,
    email,
    isConfirmed = false,
  }: TUserServiceInputModel): Promise<Result<string | null>> => {
    const errors: [] | TExtension[] = await usersService.checkIfFieldIsUnique({
      login,
      email,
    });
    if (errors.length) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Bad request",
        extensions: errors,
      };
    }

    const passwordHash: string = await bcryptService.generateHash(password);
    const newUserAccount: TUserAccountRepViewModel = {
      _id: new ObjectId(),
      accountData: {
        userName: login,
        passwordHash,
        email,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: new ObjectId().toString(),
        expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
        isConfirmed,
      },
      passwordResetConfirmation: {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: null,
      },
    };

    const createdUserId: string = await usersRepository.createUserAccount(
      newUserAccount
    );

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
  }): Promise<Result<TUserControllerViewModel | null>> => {
    const user: TUserAccountRepViewModel | null =
      await usersRepository.getByLoginOrEmail(loginOrEmail);

    if (!user) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "loginOrEmail", message: "Not Found" }],
      };
    }

    const isPasswordCorrect: boolean = await bcryptService.checkPassword(
      password,
      user.accountData.passwordHash
    );
    if (!isPasswordCorrect) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Bad Request",
        extensions: [{ field: "password", message: "Wrong password" }],
      };
    }

    if (!user.emailConfirmation.isConfirmed) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Email is not confirmed",
        extensions: [{ field: "email", message: "Email is not confirmed" }],
      };
    }

    return {
      status: RESULT_STATUS.SUCCESS,
      data: mapUser(user),
      extensions: [],
    };
  },
};

export default usersService;
