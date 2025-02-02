import { ObjectId } from "mongodb";
import TUserControllerViewModel from "./models/UserControllerViewModel";
import { UserModelDb } from "../db/db";
import { TResponseWithPagination, TSortDirection } from "../common/types/types";
import { SORT_DIRECTION } from "../common/settings";
import UserAccountRepViewModel from "./models/UserAccountRepViewModel";

class UsersQueryRepository {
  private mapUser(user: UserAccountRepViewModel): TUserControllerViewModel {
    return {
      id: user._id.toString(),
      login: user.accountData.userName,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }

  private mapUsers(
    users: UserAccountRepViewModel[] | []
  ): TUserControllerViewModel[] {
    return users.map(this.mapUser);
  }

  private async getUsersCount({
    searchEmailTerm,
    searchLoginTerm,
  }: {
    searchEmailTerm: string | null;
    searchLoginTerm: string | null;
  }): Promise<number> {
    const filters: Record<string, RegExp>[] = [];
    if (searchEmailTerm)
      filters.push({ "accountData.email": new RegExp(searchEmailTerm, "i") });
    if (searchLoginTerm)
      filters.push({
        "accountData.userName": new RegExp(searchLoginTerm, "i"),
      });

    return await UserModelDb.countDocuments(
      filters.length ? { $or: filters } : {}
    );
  }

  async getUserById(id: string): Promise<TUserControllerViewModel | null> {
    if (!ObjectId.isValid(id)) return null;

    const user: UserAccountRepViewModel | null = await UserModelDb.findById(
      new ObjectId(id)
    ).lean();

    return user ? this.mapUser(user) : null;
  }

  async getAllUsers({
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
  }): Promise<TResponseWithPagination<TUserControllerViewModel[] | []>> {
    // Pagination
    const usersCount: number = await this.getUsersCount({
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

    const users: UserAccountRepViewModel[] | [] = await UserModelDb.find(
      filters.length ? { $or: filters } : {}
    )
      .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
      .skip(usersToSkip)
      .limit(pageSize)
      .lean();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: usersCount,
      items: this.mapUsers(users),
    };
  }
}

export default new UsersQueryRepository();
