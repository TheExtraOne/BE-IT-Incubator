import { userCollection } from "../db";
import { TUserRepViewModel } from "../models";

const usersQueryRepository = {
  getAllUsers: async (): Promise<TUserRepViewModel[] | []> => {
    const filter: Record<string, RegExp> | Record<string, never> = {};
    // if (searchNameTerm) filter.name = new RegExp(searchNameTerm, "i");

    return await userCollection.find(filter).toArray();
  },
};

export default usersQueryRepository;
