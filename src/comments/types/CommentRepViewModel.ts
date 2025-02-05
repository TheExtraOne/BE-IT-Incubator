import { ObjectId } from "mongodb";
import { TLikesInfo } from "../../common/types/types";

export type TCommentatorInfo = {
  userId: string;
  userLogin: string;
};
// type TCommentRepViewModel = WithId<{
//   /**
//    * content of the comment
//    */
//   content: string;
//   /**
//    * commentatorInfo includes user id and login
//    */
//   commentatorInfo: TCommentatorInfo;
//   /**
//    * Date of creating in ISO format
//    */
//   createdAt: string;
//   /**
//    * id of the post
//    */
//   postId: string;
//   /**
//    * Likes information: count, userStatus
//    */
//   likesInfo:TLikesInfo;
// }>;
class CommentRepViewModel {
  constructor(
    public _id: ObjectId,
    public content: string,
    public commentatorInfo: TCommentatorInfo,
    public createdAt: string,
    public postId: string,
    public likesInfo: TLikesInfo
  ) {}
}

export default CommentRepViewModel;
