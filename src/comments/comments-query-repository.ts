import { ObjectId } from "mongodb";
import { commentCollection } from "../db/db";
import { SORT_DIRECTION } from "../settings";
import TCommentRepViewModel from "./models/CommentRepViewModel";
import TCommentControllerViewModel from "./models/CommentServiceViewModel";

const mapComment = (
  comment: TCommentRepViewModel
): TCommentControllerViewModel => ({
  id: comment._id.toString(),
  content: comment.content,
  commentatorInfo: comment.commentatorInfo,
  createdAt: comment.createdAt,
});

// const mapUsers = (
//   users: TUserRepViewModel[] | []
// ): TUserControllerViewModel[] => users.map(mapUser);

const commentsQueryRepository = {
  //   getUsersCount: async ({
  //     searchEmailTerm,
  //     searchLoginTerm,
  //   }: {
  //     searchEmailTerm: string | null;
  //     searchLoginTerm: string | null;
  //   }): Promise<number> => {
  //     const filters: Record<string, RegExp>[] = [];
  //     if (searchEmailTerm)
  //       filters.push({ email: new RegExp(searchEmailTerm, "i") });
  //     if (searchLoginTerm)
  //       filters.push({ login: new RegExp(searchLoginTerm, "i") });

  //     return await userCollection.countDocuments(
  //       filters.length ? { $or: filters } : {}
  //     );
  //   },

  getCommentById: async (
    id: string
  ): Promise<TCommentControllerViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;

    const comment: TCommentRepViewModel | null =
      await commentCollection.findOne({
        _id: new ObjectId(id),
      });

    return comment ? mapComment(comment) : null;
  },

  //   getAllUsers: async ({
  //     searchEmailTerm,
  //     searchLoginTerm,
  //     sortBy,
  //     sortDirection,
  //     pageNumber,
  //     pageSize,
  //   }: {
  //     searchEmailTerm: string | null;
  //     searchLoginTerm: string | null;
  //     sortBy: string;
  //     sortDirection: TSortDirection;
  //     pageNumber: number;
  //     pageSize: number;
  //   }): Promise<TResponseWithPagination<TUserControllerViewModel[] | []>> => {
  //     // Pagination
  //     const usersCount: number = await usersQueryRepository.getUsersCount({
  //       searchEmailTerm,
  //       searchLoginTerm,
  //     });
  //     const pagesCount =
  //       usersCount && pageSize ? Math.ceil(usersCount / pageSize) : 0;
  //     const usersToSkip = (pageNumber - 1) * pageSize;

  //     // Filtration
  //     const filters: Record<string, RegExp>[] = [];
  //     if (searchEmailTerm)
  //       filters.push({ email: new RegExp(searchEmailTerm, "i") });
  //     if (searchLoginTerm)
  //       filters.push({ login: new RegExp(searchLoginTerm, "i") });

  //     const users: TUserRepViewModel[] | [] = await userCollection
  //       .find(filters.length ? { $or: filters } : {})
  //       .sort({ [sortBy]: sortDirection === SORT_DIRECTION.ASC ? 1 : -1 })
  //       .skip(usersToSkip)
  //       .limit(pageSize)
  //       .toArray();

  //     return {
  //       pagesCount,
  //       page: pageNumber,
  //       pageSize,
  //       totalCount: usersCount,
  //       items: mapUsers(users),
  //     };
  //   },
};

export default commentsQueryRepository;
