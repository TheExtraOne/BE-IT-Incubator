import { ObjectId } from "mongodb";
import { TLikesInfo } from "../../common/types/types";

// type PostRepViewModel = WithId<{
//   /**
//    * title of the post
//    */
//   title: string;
//   /**
//    * shortDescription of the post
//    */
//   shortDescription: string;
//   /**
//    * main content of the post
//    */
//   content: string;
//   /**
//    * id of the blog to which the post belongs
//    */
//   blogId: string;
//   /**
//    * name of the blog to which the post belongs
//    */
//   blogName: string;
//   /**
//    * Date of creating in ISO format
//    */
//   createdAt: string;
// }>;

class PostRepViewModel {
  constructor(
    public _id: ObjectId,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: TLikesInfo
  ) {}
}

export default PostRepViewModel;
