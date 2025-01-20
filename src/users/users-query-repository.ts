import { ObjectId } from "mongodb";
import TUserRepViewModel from "./models/UserRepViewModel";
import TUserControllerViewModel from "./models/UserControllerViewModel";
import { userCollection } from "../db/db";
import { TResponseWithPagination, TSortDirection } from "../common/types/types";
import { SORT_DIRECTION } from "../common/settings";

const mapUser = (user: TUserRepViewModel): TUserControllerViewModel => ({
  id: user._id.toString(),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
});

const mapUsers = (
  users: TUserRepViewModel[] | []
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
      filters.push({ email: new RegExp(searchEmailTerm, "i") });
    if (searchLoginTerm)
      filters.push({ login: new RegExp(searchLoginTerm, "i") });

    return await userCollection.countDocuments(
      filters.length ? { $or: filters } : {}
    );
  },

  getUserById: async (id: string) => {
    if (!ObjectId.isValid(id)) return null;
    const user: TUserRepViewModel | null = await userCollection.findOne({
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
    const pagesCount =
      usersCount && pageSize ? Math.ceil(usersCount / pageSize) : 0;
    const usersToSkip = (pageNumber - 1) * pageSize;

    // Filtration
    const filters: Record<string, RegExp>[] = [];
    if (searchEmailTerm)
      filters.push({ email: new RegExp(searchEmailTerm, "i") });
    if (searchLoginTerm)
      filters.push({ login: new RegExp(searchLoginTerm, "i") });

    const users: TUserRepViewModel[] | [] = await userCollection
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
