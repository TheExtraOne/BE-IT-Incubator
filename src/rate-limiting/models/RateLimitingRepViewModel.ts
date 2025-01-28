import { WithId, OptionalUnlessRequiredId } from "mongodb";

type TRateLimitingRepViewModel = WithId<{
  /**
   * client ip
   */
  ip: string;
  /**
   * baseUrl of the request
   */
  URL: string;
  /**
   * Date of the request
   */
  date: Date;
}>;

export default TRateLimitingRepViewModel;
