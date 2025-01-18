type TCommentsServiceInputModel = {
  /**
   * content of the comments
   */
  content: string;
  /**
   * id of the user
   */
  userId: string;
  /**
   * id of the post
   */
  postId: string;
};

export default TCommentsServiceInputModel;
