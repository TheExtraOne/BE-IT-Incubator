import usersService from "../users/users-service";
import { RESULT_STATUS } from "../common/settings";
import { Result } from "../common/types/types";
import mailManager from "../managers/mail-manager";

const authService = {
  registerUser: async ({
    login,
    email,
    password,
  }: {
    login: string;
    email: string;
    password: string;
  }): Promise<Result> => {
    // Checking if login and email are unique
    const errors = await usersService.checkIfFieldIsUnique({
      login,
      email,
    });

    if (errors.length) {
      return {
        status: RESULT_STATUS.BAD_REQUEST,
        errorMessage: "Bad request",
        extensions: errors,
        data: null,
      };
    }

    return await mailManager.sendRegistrationMail({ login, email, password });
  },
};

export default authService;
