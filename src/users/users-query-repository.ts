import { ObjectId } from "mongodb";
import TUserControllerViewModel from "./models/UserControllerViewModel";
import { userCollection } from "../db/db";
import { TResponseWithPagination, TSortDirection } from "../common/types/types";
import { SORT_DIRECTION } from "../common/settings";
import TUserAccountRepViewModel from "./models/UserAccountRepViewModel";

const mapUser = (user: TUserAccountRepViewModel): TUserControllerViewModel => ({
  id: user._id.toString(),
  login: user.accountData.userName,
  email: user.accountData.email,
  createdAt: user.accountData.createdAt,
});

const mapUsers = (
  users: TUserAccountRepViewModel[] | []
): TUserControllerViewModel[] => users.map(mapUser);

const usersQueryRepository = {
  _getUsersCount: async ({
    searchEmailTerm,
    searchLoginTerm,
  }: {
    searchEmailTerm: string | null;
    searchLoginTerm: string | null;
  }): Promise<number> => {
    const filters: Record<string, RegExp>[] = [];
    if (searchEmailTerm)
      filters.push({ "accountData.email": new RegExp(searchEmailTerm, "i") });
    if (searchLoginTerm)
      filters.push({
        "accountData.userName": new RegExp(searchLoginTerm, "i"),
      });

    return await userCollection.countDocuments(
      filters.length ? { $or: filters } : {}
    );
  },

  getUserById: async (id: string) => {
    if (!ObjectId.isValid(id)) return null;
    const user: TUserAccountRepViewModel | null = await userCollection.findOne({
      _id: new ObjectId(id),
    });

    return user ? mapUser(user) : null;
  },

  getAllUsers: async ({
    searchEmailTerm,
    searchLoginTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: {
    searchEmailTerm: string | null;
    searchLoginTerm: string | null;
    sortBy: string;
    sortDirection: TSortDirection;
    pageNumber: number;
    pageSize: number;
  }): Promise<TResponseWithPagination<TUserControllerViewModel[] | []>> => {
    // Pagination
    const usersCount: number = await usersQueryRepository._getUsersCount({
      searchEmailTerm,
      searchLoginTerm,
    });
    const pagesCount: number =
      usersCount && pageSize ? Math.ceil(usersCount / pageSize) : 0;
    const usersToSkip = (pageNumber - 1) * pageSize;

    // Filtration
    const filters: Record<string, RegExp>[] = [];
    if (searchEmailTerm)
      filters.push({ "accountData.email": new RegExp(searchEmailTerm, "i") });
    if (searchLoginTerm)
      filters.push({
        "accountData.userName": new RegExp(searchLoginTerm, "i"),
      });

    const users: TUserAccountRepViewModel[] | [] = await userCollection
      .find(filters.length ? { $or: filters } : {})
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(usersToSkip)
      .limit(pageSize)
      .toArray();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: usersCount,
      items: mapUsers(users),
    };
  },
};

export default usersQueryRepository;
