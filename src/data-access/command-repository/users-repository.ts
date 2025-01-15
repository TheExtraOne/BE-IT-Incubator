import { ObjectId } from "mongodb";
import { userCollection } from "../db";
import { TUserRepViewModel } from "../models";

const usersRepository = {
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
};

export default usersRepository;
