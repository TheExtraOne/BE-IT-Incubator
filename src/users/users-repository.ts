import { ObjectId } from "mongodb";
import { UserModelClass } from "../db/db";
import TUserAccountRepViewModel, {
  TEmailConfirmation,
  TPasswordResetConfirmation,
} from "./models/UserAccountRepViewModel";
import { HydratedDocument } from "mongoose";

const usersRepository = {
  getUserById: async (
    id: string
  ): Promise<HydratedDocument<TUserAccountRepViewModel> | null> => {
    if (!ObjectId.isValid(id)) return null;

    const user: HydratedDocument<TUserAccountRepViewModel> | null =
      await UserModelClass.findById(new ObjectId(id));

    return user;
  },

  getUserByConfirmationCode: async (
    confirmationCode: string
  ): Promise<HydratedDocument<TUserAccountRepViewModel> | null> => {
    const user: HydratedDocument<TUserAccountRepViewModel> | null =
      await UserModelClass.findOne({
        "emailConfirmation.confirmationCode": confirmationCode,
      });

    return user;
  },

  getUserByRecoveryCode: async (
    recoveryCode: string
  ): Promise<HydratedDocument<TUserAccountRepViewModel> | null> => {
    const user: HydratedDocument<TUserAccountRepViewModel> | null =
      await UserModelClass.findOne({
        "passwordResetConfirmation.recoveryCode": recoveryCode,
      });

    return user;
  },

  saveUserAccount: async (
    userAccount: HydratedDocument<TUserAccountRepViewModel>
  ): Promise<void> => {
    await userAccount.save();
  },

  deleteUserAccount: async (
    userAccount: HydratedDocument<TUserAccountRepViewModel>
  ): Promise<void> => {
    await userAccount.deleteOne();
  },

  isUniqueInDatabase: async ({
    fieldName,
    fieldValue,
  }: {
    fieldName: string;
    fieldValue: string;
  }): Promise<boolean> => {
    const user = await UserModelClass.findOne()
      .where(fieldName, fieldValue)
      .lean();

    return !user;
  },

  getByLoginOrEmail: async (
    loginOrEmail: string
  ): Promise<HydratedDocument<TUserAccountRepViewModel> | null> =>
    await UserModelClass.findOne().or([
      { "accountData.userName": loginOrEmail },
      { "accountData.email": loginOrEmail },
    ]),
};

export default usersRepository;
