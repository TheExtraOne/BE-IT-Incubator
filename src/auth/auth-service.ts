import usersService from "../users/users-service";
import { RESULT_STATUS } from "../common/settings";
import { Result } from "../common/types/types";
import mailManager from "../managers/mail-manager";
import usersRepository from "../users/users-repository";
import TUserAccountRepViewModel from "../users/models/UserAccountRepViewModel";
import { v4 as uuidv4 } from "uuid";
import { add } from "date-fns";

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
    // Creating user, check if login and email are unique is inside userService.createUser
    const result_user_creation: Result<string | null> =
      await usersService.createUserAccount({
        login,
        password,
        email,
        isConfirmed: false,
      });
    if (result_user_creation.status !== RESULT_STATUS.SUCCESS)
      return result_user_creation;

    const createdUserId: string | null = result_user_creation.data;
    const createdUser: TUserAccountRepViewModel | null =
      await usersRepository.getUserById(createdUserId!);

    const result_mail: Result<string | null> =
      await mailManager.sendRegistrationMail({
        email,
        confirmationCode: createdUser?.emailConfirmation.confirmationCode!,
      });

    if (result_mail.status !== RESULT_STATUS.SUCCESS)
      await usersService.deleteUserById(createdUserId!);

    return result_mail;
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
    const emailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), { hours: 1, minutes: 3 }),
      isConfirmed: false,
    };
    await usersRepository.updateUserEmailConfirmationByEmail({
      emailConfirmation,
      email,
    });

    // Send email with new confirmation code
    const result = await mailManager.sendRegistrationMail({
      email,
      confirmationCode: emailConfirmation.confirmationCode,
    });

    return result;
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
            field: "confirmationCode",
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
            field: "confirmationCode",
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
            field: "confirmationCode",
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
};

export default authService;
