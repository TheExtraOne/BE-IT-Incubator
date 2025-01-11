type TPostRepViewModel = {
  /**
   * _id in DB of the post
   */
  _id?: string;
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
  /**
   * Date of creating in ISO format
   */
  createdAt: string;
};

export default TPostRepViewModel;
