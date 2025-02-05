import { LIKE_STATUS } from "../../common/settings";

type TPostControllerViewModel = {
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
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LIKE_STATUS;
    newestLikes: [] | { addedAt: Date; userId: string; login: string }[];
  };
};

export default TPostControllerViewModel;
