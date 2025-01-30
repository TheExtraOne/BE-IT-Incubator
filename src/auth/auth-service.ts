import usersService from "../users/users-service";
import { RESULT_STATUS } from "../common/settings";
import { Result } from "../common/types/types";
import mailManager from "../managers/mail-manager";
import usersRepository from "../users/users-repository";
import TUserAccountRepViewModel, {
  TEmailConfirmation,
  TPasswordResetConfirmation,
} from "../users/models/UserAccountRepViewModel";
import { add } from "date-fns";
import { ObjectId } from "mongodb";
import bcryptService from "../adapters/bcypt-service";

const authService = {
  registerUser: async ({
    login,
    email,
    password,
  }: {
    login: string;
    email: string;
    password: string;
  }): Promise<Result<string | null>> => {
    // Creating user, check if login and email are unique is inside userService
    const result: Result<string | null> = await usersService.createUserAccount({
      login,
      password,
      email,
      isConfirmed: false,
    });
    if (result.status !== RESULT_STATUS.SUCCESS) return result;

    const createdUserId: string | null = result.data;
    const createdUser: TUserAccountRepViewModel | null =
      await usersRepository.getUserById(createdUserId!);

    mailManager
      .sendRegistrationMail({
        email,
        confirmationCode: createdUser?.emailConfirmation.confirmationCode!,
      })
      .catch((error) => console.log(error));

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  },

  resendRegistrationEmail: async (
    email: string
  ): Promise<Result<string | null>> => {
    const user: TUserAccountRepViewModel | null =
      await usersRepository.getByLoginOrEmail(email);
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
    usersRepository.updateUserEmailConfirmationByEmail({
      emailConfirmation,
      email,
    });

    // Send email with new confirmation code
    mailManager.sendRegistrationMail({
      email,
      confirmationCode: emailConfirmation.confirmationCode,
    });

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  },

  recoverPassword: async (email: string): Promise<Result<string | null>> => {
    // Check if user with such email exist
    const user: TUserAccountRepViewModel | null =
      await usersRepository.getByLoginOrEmail(email);
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
      confirmationCode: new ObjectId().toString(),
      expirationDate: add(new Date(), { minutes: 30 }),
      isConfirmed: false,
    };
    await usersRepository.updateUserPasswordResetConfirmationByEmail({
      passwordResetConfirmation,
      email,
    });

    // Send email with new confirmation code
    mailManager.sendPasswordRecoveryMail({
      email,
      confirmationCode: passwordResetConfirmation.confirmationCode!,
    });

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  },

  confirmRegistration: async (confirmationCode: string): Promise<Result> => {
    const user: TUserAccountRepViewModel | null =
      await usersRepository.getUserByConfirmationCode(confirmationCode);
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
    await usersRepository.updateUserRegistrationConfirmationById({
      id: String(user._id),
    });

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  },

  setNewPassword: async (
    newPassword: string,
    recoveryCode: string
  ): Promise<Result> => {
    const user: TUserAccountRepViewModel | null =
      await usersRepository.getUserByRecoveryCode(recoveryCode);
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
    const passwordHash: string = await bcryptService.generateHash(newPassword);
    await usersRepository.updateUserPasswordResetConfirmationById({
      id: user._id.toString(),
      newPassword: passwordHash,
    });

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  },
};

export default authService;
