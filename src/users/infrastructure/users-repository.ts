import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";
import UserAccountRepViewModel from "../types/UserAccountRepViewModel";
import { UserModelDb } from "../domain/user-model";

class UsersRepository {
  async getUserById(
    id: string
  ): Promise<HydratedDocument<UserAccountRepViewModel> | null> {
    if (!ObjectId.isValid(id)) return null;

    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await UserModelDb.findById(new ObjectId(id));

    return user;
  }

  async getUserByConfirmationCode(
    confirmationCode: string
  ): Promise<HydratedDocument<UserAccountRepViewModel> | null> {
    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await UserModelDb.findOne({
        "emailConfirmation.confirmationCode": confirmationCode,
      });

    return user;
  }

  async getUserByRecoveryCode(
    recoveryCode: string
  ): Promise<HydratedDocument<UserAccountRepViewModel> | null> {
    const user: HydratedDocument<UserAccountRepViewModel> | null =
      await UserModelDb.findOne({
        "passwordResetConfirmation.recoveryCode": recoveryCode,
      });

    return user;
  }

  async saveUserAccount(
    userAccount: HydratedDocument<UserAccountRepViewModel>
  ): Promise<void> {
    await userAccount.save();
  }

  async deleteUserAccount(
    userAccount: HydratedDocument<UserAccountRepViewModel>
  ): Promise<void> {
    await userAccount.deleteOne();
  }

  async isUniqueInDatabase({
    fieldName,
    fieldValue,
  }: {
    fieldName: string;
    fieldValue: string;
  }): Promise<boolean> {
    const user = await UserModelDb.findOne()
      .where(fieldName, fieldValue)
      .lean();

    return !user;
  }

  async getByLoginOrEmail(
    loginOrEmail: string
  ): Promise<HydratedDocument<UserAccountRepViewModel> | null> {
    return await UserModelDb.findOne().or([
      { "accountData.userName": loginOrEmail },
      { "accountData.email": loginOrEmail },
    ]);
  }
}

export default UsersRepository;
