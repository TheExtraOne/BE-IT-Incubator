import { ObjectId } from "mongodb";

// type TRefreshTokensMetaRepViewModel = WithId<{
//   /**
//    * IP address of device during signing in
//    */
//   ip: string;
//   /**
//    * Device name: for example Chrome 105 (received by parsing http header "user-agent")
//    */
//   title: string;
//   /**
//    * Date of the last generating of refresh token
//    */
//   lastActiveDate: string;
//   /**
//    * Date of the expiration of refresh token
//    */
//   expirationDate: string;
//   /**
//    * Id of user
//    */
//   userId: string;
// }>;
class RefreshTokensMetaRepViewModel {
  constructor(
    public _id: ObjectId,
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public expirationDate: string,
    public userId: string
  ) {}
}

export default RefreshTokensMetaRepViewModel;
