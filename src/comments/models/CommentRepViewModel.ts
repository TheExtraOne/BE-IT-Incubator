import { WithId, OptionalUnlessRequiredId } from "mongodb";

type TCommentRepViewModel = WithId<{
  /**
   * content of the comment
   */
  content: string;
  /**
   * commentatorInfo includes user id and login
   */
  commentatorInfo: { userId: string; userLogin: string };
  /**
   * Date of creating in ISO format
   */
  createdAt: string;
  /**
   * id of the post
   */
  postId: string;
}>;

export default TCommentRepViewModel;
