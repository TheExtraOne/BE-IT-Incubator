type TPostViewModel = {
  /**
   * id of the post
   */
  id: string;
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
  /**
   * name of the blog to which the post belongs
   */
  blogName: string;
};

export default TPostViewModel;
