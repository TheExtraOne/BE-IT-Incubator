import { ObjectId } from "mongodb";

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
// }>;
class CommentRepViewModel {
  constructor(
    public _id: ObjectId,
    public content: string,
    public commentatorInfo: TCommentatorInfo,
    public createdAt: string,
    public postId: string
  ) {}
}

export default CommentRepViewModel;
