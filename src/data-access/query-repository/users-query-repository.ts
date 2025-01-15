import { SORT_DIRECTION } from "../../settings";
import { TSortDirection } from "../../types";
import { userCollection } from "../db";
import { TUserRepViewModel } from "../models";

const usersQueryRepository = {
  getUsersCount: async ({
    searchEmailTerm,
    searchLoginTerm,
  }: {
    searchEmailTerm: string | null;
    searchLoginTerm: string | null;
  }): Promise<number> => {
    const filters: Record<string, RegExp>[] = [];
    if (searchEmailTerm)
      filters.push({ email: new RegExp(searchEmailTerm, "i") });
    if (searchLoginTerm)
      filters.push({ login: new RegExp(searchLoginTerm, "i") });

    return await userCollection.countDocuments(
      filters.length ? { $or: filters } : {}
    );
  },

  getAllUsers: async ({
    searchEmailTerm,
    searchLoginTerm,
    sortBy,
    sortDirection,
    usersToSkip,
    pageSize,
  }: {
    searchEmailTerm: string | null;
    searchLoginTerm: string | null;
    sortBy: string;
    sortDirection: TSortDirection;
    usersToSkip: number;
    pageSize: number;
  }): Promise<TUserRepViewModel[] | []> => {
    const filters: Record<string, RegExp>[] = [];
    if (searchEmailTerm)
      filters.push({ email: new RegExp(searchEmailTerm, "i") });
    if (searchLoginTerm)
      filters.push({ login: new RegExp(searchLoginTerm, "i") });

    return await userCollection
      .find(filters.length ? { $or: filters } : {})
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(usersToSkip)
      .limit(pageSize)
      .toArray();
  },

  getByLoginOrEmail: async (
    loginOrEmail: string
  ): Promise<TUserRepViewModel | null> =>
    await userCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    }),

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
};

export default usersQueryRepository;
