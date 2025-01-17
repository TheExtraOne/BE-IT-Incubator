import { ObjectId } from "mongodb";
import TUserRepViewModel from "./models/UserRepViewModel";
import { userCollection } from "../db/db";

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
