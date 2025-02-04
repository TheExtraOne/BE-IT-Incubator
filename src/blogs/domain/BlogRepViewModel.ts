import { ObjectId } from "mongodb";

// type TBlogRepViewModel = WithId<{
//   /**
//    * name of the blog
//    */
//   name: string;
//   /**
//    * description of the blog
//    */
//   description: string;
//   /**
//    * websiteUrl of the blog
//    */
//   websiteUrl: string;
//   /**
//    * Date of creating in ISO format
//    */
//   createdAt: string;
//   /**
//    * Flag if user has not expired membership subscription to blog
//    */
//   isMembership: boolean;
// }>;
class BlogRepViewModel {
  constructor(
    public _id: ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean
  ) {}
}

export default BlogRepViewModel;
