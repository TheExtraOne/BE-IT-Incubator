import { ObjectId } from "mongodb";
import { UserModel } from "../db/db";
import TUserAccountRepViewModel, {
  TEmailConfirmation,
} from "./models/UserAccountRepViewModel";

const usersRepository = {
  getUserById: async (id: string): Promise<TUserAccountRepViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    const user: TUserAccountRepViewModel | null = await UserModel.findOne({
      _id: new ObjectId(id),
    });

    return user;
  },

  getUserByConfirmationCode: async (
    confirmationCode: string
  ): Promise<TUserAccountRepViewModel | null> => {
    const user: TUserAccountRepViewModel | null = await UserModel.findOne({
      "emailConfirmation.confirmationCode": confirmationCode,
    });

    return user;
  },

  createUserAccount: async (
    newUserAccount: TUserAccountRepViewModel
  ): Promise<string> => {
    const { _id: insertedId } = await UserModel.create(newUserAccount);

    return insertedId.toString();
  },

  deleteUserById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await UserModel.deleteOne({
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
    const user = await UserModel.findOne({ [fieldName]: fieldValue });

    return !user;
  },

  getByLoginOrEmail: async (
    loginOrEmail: string
  ): Promise<TUserAccountRepViewModel | null> =>
    await UserModel.findOne({
      $or: [
        { "accountData.userName": loginOrEmail },
        { "accountData.email": loginOrEmail },
      ],
    }),

  updateUserRegistrationConfirmationById: async ({
    id,
    isRegistrationConfirmed = true,
  }: {
    id: string;
    isRegistrationConfirmed?: boolean;
  }): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { matchedCount } = await UserModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: { "emailConfirmation.isConfirmed": isRegistrationConfirmed } }
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
    const { matchedCount } = await UserModel.updateOne(
      { "accountData.email": email },
      {
        $set: { emailConfirmation },
      }
    );
    return !!matchedCount;
  },
};

export default usersRepository;
