import usersService from "../users/users-service";
import { RESULT_STATUS } from "../common/settings";
import { Result } from "../common/types/types";
import mailManager from "../managers/mail-manager";
import usersRepository from "../users/users-repository";
import TUserAccountRepViewModel from "../users/models/UserAccountRepViewModel";

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
};

export default authService;
