type TRefreshTokenMetaControllerViewModel = {
  /**
   * IP address of device during signing in
   */
  ip: string;
  /**
   * Device name: for example Chrome 105 (received by parsing http header "user-agent")
   */
  title: string;
  /**
   * Date of the last generating of refresh/access tokens
   */
  lastActiveDate: string;
  /**
   * Id of connected device session
   */
  deviceId: string;
};

export default TRefreshTokenMetaControllerViewModel;
