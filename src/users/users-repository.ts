import { ObjectId } from "mongodb";
import TUserRepViewModel from "./models/UserRepViewModel";
import { userCollection } from "../db/db";

const usersRepository = {
  getUserById: async (id: string): Promise<TUserRepViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;
    const user: TUserRepViewModel | null = await userCollection.findOne({
      _id: new ObjectId(id),
    });

    return user;
  },

  createUser: async (newUser: TUserRepViewModel): Promise<string> => {
    const { insertedId } = await userCollection.insertOne(newUser);

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
    const users = await userCollection
      .find({ [fieldName]: fieldValue })
      .toArray();

    return !!users.length;
  },

  getByLoginOrEmail: async (
    loginOrEmail: string
  ): Promise<TUserRepViewModel | null> =>
    await userCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    }),
};

export default usersRepository;
