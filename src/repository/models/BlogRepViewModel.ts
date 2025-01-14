import { WithId, OptionalUnlessRequiredId } from "mongodb";

type TBlogRepViewModel = WithId<{
  /**
   * name of the blog
   */
  name: string;
  /**
   * description of the blog
   */
  description: string;
  /**
   * websiteUrl of the blog
   */
  websiteUrl: string;
  /**
   * Date of creating in ISO format
   */
  createdAt: string;
  /**
   * Flag if user has not expired membership subscription to blog
   */
  isMembership: boolean;
}>;

export default TBlogRepViewModel;
