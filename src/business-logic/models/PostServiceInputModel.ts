type TPostServiceInputModel = {
  /**
   * title of the post
   */
  title: string;
  /**
   * shortDescription of the post
   */
  shortDescription: string;
  /**
   * main content of the post
   */
  content: string;
  /**
   * id of the blog to which the post belongs
   */
  blogId: string;
};

export default TPostServiceInputModel;
