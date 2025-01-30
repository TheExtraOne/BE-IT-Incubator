import { ObjectId } from "mongodb";
import { UserModelClass } from "../db/db";
import TUserAccountRepViewModel, {
  TEmailConfirmation,
  TPasswordResetConfirmation,
} from "./models/UserAccountRepViewModel";

const usersRepository = {
  getUserById: async (id: string): Promise<TUserAccountRepViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    const user: TUserAccountRepViewModel | null = await UserModelClass.findOne({
      _id: new ObjectId(id),
    }).lean();

    return user;
  },

  getUserByConfirmationCode: async (
    confirmationCode: string
  ): Promise<TUserAccountRepViewModel | null> => {
    const user: TUserAccountRepViewModel | null = await UserModelClass.findOne({
      "emailConfirmation.confirmationCode": confirmationCode,
    }).lean();

    return user;
  },

  getUserByRecoveryCode: async (
    recoveryCode: string
  ): Promise<TUserAccountRepViewModel | null> => {
    const user: TUserAccountRepViewModel | null = await UserModelClass.findOne({
      "passwordResetConfirmation.recoveryCode": recoveryCode,
    }).lean();

    return user;
  },

  createUserAccount: async (
    newUserAccount: TUserAccountRepViewModel
  ): Promise<string> => {
    const { _id: insertedId } = await UserModelClass.create(newUserAccount);

    return insertedId.toString();
  },

  deleteUserById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await UserModelClass.deleteOne({
      _id: new ObjectId(id),
    });

    return !!deletedCount;
  },

  isUniqueInDatabase: async ({
    fieldName,
    fieldValue,
  }: {
    fieldName: string;
    fieldValue: string;
  }): Promise<boolean> => {
    const user = await UserModelClass.findOne({
      [fieldName]: fieldValue,
    }).lean();

    return !user;
  },

  getByLoginOrEmail: async (
    loginOrEmail: string
  ): Promise<TUserAccountRepViewModel | null> =>
    await UserModelClass.findOne({
      $or: [
        { "accountData.userName": loginOrEmail },
        { "accountData.email": loginOrEmail },
      ],
    }).lean(),

  updateUserRegistrationConfirmationById: async ({
    id,
    isRegistrationConfirmed = true,
  }: {
    id: string;
    isRegistrationConfirmed?: boolean;
  }): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { matchedCount } = await UserModelClass.updateOne(
      { _id: new ObjectId(id) },
      { $set: { "emailConfirmation.isConfirmed": isRegistrationConfirmed } }
    );

    return !!matchedCount;
  },

  updateUserPasswordResetConfirmationById: async ({
    id,
    newPassword,
  }: {
    id: string;
    newPassword: string;
  }): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { matchedCount } = await UserModelClass.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "passwordResetConfirmation.isConfirmed": true,
          newPassword: newPassword,
        },
      }
    );

    return !!matchedCount;
  },

  updateUserPasswordResetConfirmationByEmail: async ({
    passwordResetConfirmation,
    email,
  }: {
    passwordResetConfirmation: TPasswordResetConfirmation;
    email: string;
  }): Promise<boolean> => {
    const { matchedCount } = await UserModelClass.updateOne(
      { "accountData.email": email },
      {
        $set: { passwordResetConfirmation: passwordResetConfirmation },
      }
    );
    return !!matchedCount;
  },

  updateUserEmailConfirmationByEmail: async ({
    emailConfirmation,
    email,
  }: {
    emailConfirmation: TEmailConfirmation;
    email: string;
  }): Promise<boolean> => {
    const { matchedCount } = await UserModelClass.updateOne(
      { "accountData.email": email },
      {
        $set: { emailConfirmation },
      }
    );
    return !!matchedCount;
  },
};

export default usersRepository;
