import { ObjectId } from "mongodb";
import { Result, TExtension } from "../../common/types/types";
import TUserServiceInputModel from "../domain/UserServiceInputModel";
import { RESULT_STATUS } from "../../common/settings";
import UserAccountRepViewModel from "../domain/UserAccountRepViewModel";
import TUserControllerViewModel from "../domain/UserControllerViewModel";
import { add } from "date-fns";
import BcryptService from "../../adapters/bcrypt-service";
import { UserModelDb } from "../../db/db";
import { HydratedDocument } from "mongoose";
import UsersRepository from "../infrastructure/users-repository";

class UsersService {
  constructor(
    private bcryptService: BcryptService,
    private usersRepository: UsersRepository
  ) {}

  private mapUser(user: UserAccountRepViewModel): TUserControllerViewModel {
    return {
      id: user._id.toString(),
      login: user.accountData.userName,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }

  async checkIsLoginUnique(login: string): Promise<boolean> {
    return await this.usersRepository.isUniqueInDatabase({
      fieldName: "accountData.userName",
      fieldValue: login,
    });
  }

  async checkIsEmailUnique(email: string): Promise<boolean> {
    return await this.usersRepository.isUniqueInDatabase({
      fieldName: "accountData.email",
      fieldValue: email,
    });
  }

  async checkIfFieldIsUnique({
    email,
    login,
  }: {
    email: string | null;
    login: string | null;
  }): Promise<TExtension[] | []> {
    const errors: TExtension[] = [];
    if (login) {
      const isLoginUnique: boolean = await this.checkIsLoginUnique(login);
      !isLoginUnique &&
        errors.push({
          message: "Login already exists",
          field: "login",
        });
    }
    if (email) {
      const isEmailUnique: boolean = await this.checkIsEmailUnique(email);
      !isEmailUnique &&
        errors.push({
          message: "Email already exists",
          field: "email",
        });
    }

    return errors;
  }

  async createUserAccount({
    login,
    password,
    email,
    isConfirmed = false,
  }: TUserServiceInputModel): Promise<Result<string | null>> {
    const errors: [] | TExtension[] = await this.checkIfFieldIsUnique({
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

    const passwordHash: string = await this.bcryptService.generateHash(
      password
    );
    const newUserAccount: UserAccountRepViewModel = new UserAccountRepViewModel(
      new ObjectId(),
      {
        userName: login,
        passwordHash,
        email,
        createdAt: new Date().toISOString(),
      },
      {
        confirmationCode: new ObjectId().toString(),
        expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
        isConfirmed,
      },
      {
        recoveryCode: null,
        expirationDate: null,
        isConfirmed: null,
      }
    );
    const userAccountInstance: HydratedDocument<UserAccountRepViewModel> =
      new UserModelDb(newUserAccount);
    await this.usersRepository.saveUserAccount(userAccountInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: newUserAccount._id.toString(),
      extensions: [],
    };
  }

  async deleteUserById(id: string): Promise<Result> {
    const userAccountInstance: HydratedDocument<UserAccountRepViewModel> | null =
      await this.usersRepository.getUserById(id);
    if (!userAccountInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "id", message: "Not found" }],
      };
    }

    await this.usersRepository.deleteUserAccount(userAccountInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async checkUserCredentials({
    loginOrEmail,
    password,
  }: {
    loginOrEmail: string;
    password: string;
  }): Promise<Result<TUserControllerViewModel | null>> {
    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await this.usersRepository.getByLoginOrEmail(loginOrEmail);

    if (!user) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "loginOrEmail", message: "Not Found" }],
      };
    }

    const isPasswordCorrect: boolean = await this.bcryptService.checkPassword(
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
      data: this.mapUser(user),
      extensions: [],
    };
  }
}

export default UsersService;
