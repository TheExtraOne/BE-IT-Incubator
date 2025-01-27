import { WithId, OptionalUnlessRequiredId } from "mongodb";

type TRefreshTokensMetaRepViewModel = WithId<{
  /**
   * IP address of device during signing in
   */
  ip: string;
  /**
   * Device name: for example Chrome 105 (received by parsing http header "user-agent")
   */
  title: string;
  /**
   * Date of the last generating of refresh token
   */
  lastActiveDate: string;
  /**
   * Date of the expiration of refresh token
   */
  expirationDate: string;
  /**
   * Id of connected device session
   */
  deviceId: string;
  /**
   * Id of user
   */
  userId: string;
}>;

export default TRefreshTokensMetaRepViewModel;
