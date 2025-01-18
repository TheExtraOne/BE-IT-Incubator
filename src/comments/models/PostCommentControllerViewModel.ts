type TCommentControllerViewModel = {
  /**
   * id of the comment
   */
  id: string;
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
};

export default TCommentControllerViewModel;
