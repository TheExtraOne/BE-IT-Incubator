import UsersService from "../../users/app/users-service";
import { RESULT_STATUS } from "../../common/settings";
import { Result } from "../../common/types/types";
import MailManager from "../../managers/mail-manager";
import UserAccountRepViewModel, {
  TEmailConfirmation,
  TPasswordResetConfirmation,
} from "../../users/types/UserAccountRepViewModel";
import { add } from "date-fns";
import { ObjectId } from "mongodb";
import BcryptService from "../../adapters/bcrypt-service";
import { HydratedDocument } from "mongoose";
import UsersRepository from "../../users/infrastructure/users-repository";
import { inject, injectable } from "inversify";

@injectable()
class AuthService {
  constructor(
    @inject("BcryptService")
    private bcryptService: BcryptService,
    @inject("MailManager")
    private mailManager: MailManager,
    @inject("UsersService")
    private usersService: UsersService,
    @inject("UsersRepository")
    private usersRepository: UsersRepository
  ) {}

  async registerUser({
    login,
    email,
    password,
  }: {
    login: string;
    email: string;
    password: string;
  }): Promise<Result> {
    // Creating user, check if login and email are unique is inside userService
    const result: Result<HydratedDocument<UserAccountRepViewModel> | null> =
      await this.usersService.createUserAccount({
        login,
        password,
        email,
      });
    if (result.status !== RESULT_STATUS.SUCCESS) return result as Result<null>;

    const confirmationCode = result.data?.emailConfirmation.confirmationCode!;
    this.mailManager
      .sendRegistrationMail({
        email,
        confirmationCode: confirmationCode,
      })
      .catch((error) => console.log(error));

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async resendRegistrationEmail(email: string): Promise<Result> {
    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await this.usersRepository.getByLoginOrEmail(email);
    // Check if user with such email exist
    if (!user) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [
          {
            field: "email",
            message: "Not Found",
          },
        ],
      };
    }
    // Check if email is already confirmed
    if (user.emailConfirmation.isConfirmed) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Bad Request",
        extensions: [
          {
            field: "email",
            message: "Email is already confirmed",
          },
        ],
      };
    }
    // Generate new confirmation code
    const emailConfirmation: TEmailConfirmation = {
      confirmationCode: new ObjectId().toString(),
      expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
      isConfirmed: false,
    };

    user.emailConfirmation = emailConfirmation;
    await this.usersRepository.saveUserAccount(user);

    // Send email with new confirmation code
    this.mailManager.sendRegistrationMail({
      email,
      confirmationCode: emailConfirmation.confirmationCode,
    });

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async recoverPassword(email: string): Promise<Result> {
    // Check if user with such email exist
    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await this.usersRepository.getByLoginOrEmail(email);
    if (!user) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [
          {
            field: "email",
            message: "Not Found",
          },
        ],
      };
    }
    // Generate new confirmation code
    const passwordResetConfirmation: TPasswordResetConfirmation = {
      recoveryCode: new ObjectId().toString(),
      expirationDate: add(new Date(), { minutes: 30 }),
      isConfirmed: false,
    };

    user.passwordResetConfirmation = passwordResetConfirmation;
    await this.usersRepository.saveUserAccount(user);

    // Send email with new confirmation code
    this.mailManager.sendPasswordRecoveryMail({
      email,
      recoveryCode: passwordResetConfirmation.recoveryCode!,
    });

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async confirmRegistration(confirmationCode: string): Promise<Result> {
    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await this.usersRepository.getUserByConfirmationCode(confirmationCode);
    // Check if user with such confirmationCode exist
    if (!user) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [
          {
            field: "code",
            message: "User with such confirmationCode does not exist",
          },
        ],
      };
    }
    // Check if confirmationCode has already been applied
    if (user.emailConfirmation.isConfirmed) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Already confirmed",
        extensions: [
          {
            field: "code",
            message: "Already confirmed",
          },
        ],
      };
    }
    // Check if confirmationCode expired
    if (user.emailConfirmation.expirationDate < new Date()) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Confirmation code expired",
        extensions: [
          {
            field: "code",
            message: "Already expired",
          },
        ],
      };
    }
    // If ok, then updating user flag
    user.emailConfirmation.isConfirmed = true;

    await this.usersRepository.saveUserAccount(user);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async setNewPassword(
    newPassword: string,
    recoveryCode: string
  ): Promise<Result> {
    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await this.usersRepository.getUserByRecoveryCode(recoveryCode);
    // Check if user with such recoveryCode exist
    if (!user) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [
          {
            field: "recoveryCode",
            message: "User with such recoveryCode does not exist",
          },
        ],
      };
    }
    // Check if recoveryCode has already been applied
    if (user.passwordResetConfirmation.isConfirmed) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Already confirmed",
        extensions: [
          {
            field: "recoveryCode",
            message: "Already confirmed",
          },
        ],
      };
    }
    // Check if recoveryCode expired
    if (
      !user?.passwordResetConfirmation?.expirationDate ||
      user.passwordResetConfirmation.expirationDate < new Date()
    ) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        data: null,
        errorMessage: "Recovery code expired",
        extensions: [
          {
            field: "recoveryCode",
            message: "Already expired",
          },
        ],
      };
    }

    // If ok, then updating user flag
    const passwordHash: string = await this.bcryptService.generateHash(
      newPassword
    );
    user.passwordResetConfirmation.isConfirmed = true;
    user.accountData.passwordHash = passwordHash;
    await this.usersRepository.saveUserAccount(user);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }
}

export default AuthService;
