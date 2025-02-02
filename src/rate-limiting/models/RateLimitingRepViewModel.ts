import { ObjectId } from "mongodb";

// type TRateLimitingRepViewModel = WithId<{
//   /**
//    * client ip
//    */
//   ip: string;
//   /**
//    * baseUrl of the request
//    */
//   URL: string;
//   /**
//    * Date of the request
//    */
//   date: Date;
// }>;

class RateLimitingRepViewModel {
  constructor(
    public _id: ObjectId,
    public ip: string,
    public URL: string,
    public date: Date
  ) {}
}

export default RateLimitingRepViewModel;
