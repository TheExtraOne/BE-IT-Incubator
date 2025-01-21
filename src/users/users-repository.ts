import { ObjectId } from "mongodb";
import { userCollection } from "../db/db";
import TUserAccountRepViewModel from "./models/UserAccountRepViewModel";

const usersRepository = {
  getUserById: async (id: string): Promise<TUserAccountRepViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    const user: TUserAccountRepViewModel | null = await userCollection.findOne({
      _id: new ObjectId(id),
    });

    return user;
  },

  getUserByConfirmationCode: async (
    confirmationCode: string
  ): Promise<TUserAccountRepViewModel | null> => {
    const user: TUserAccountRepViewModel | null = await userCollection.findOne({
      "emailConfirmation.confirmationCode": confirmationCode,
    });

    return user;
  },

  createUserAccount: async (
    newUserAccount: TUserAccountRepViewModel
  ): Promise<string> => {
    const { insertedId } = await userCollection.insertOne(newUserAccount);

    return insertedId.toString();
  },

  deleteUserById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await userCollection.deleteOne({
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
    const user = await userCollection.findOne({ [fieldName]: fieldValue });

    return !user;
  },

  getByLoginOrEmail: async (
    loginOrEmail: string
  ): Promise<TUserAccountRepViewModel | null> =>
    await userCollection.findOne({
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
    const { matchedCount } = await userCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { "emailConfirmation.isConfirmed": isRegistrationConfirmed } }
    );

    return !!matchedCount;
  },
};

export default usersRepository;
