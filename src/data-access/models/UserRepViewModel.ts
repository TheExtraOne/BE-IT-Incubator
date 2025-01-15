import { WithId, OptionalUnlessRequiredId } from "mongodb";

type TUserRepViewModel = WithId<{
  /**
   * login of the user
   */
  login: string;
  /**
   * passwordHash of the user
   */
  passwordHash: string;
  /**
   * passwordSalt of the user's password
   */
  passwordSalt: string;
  /**
   * email of the user
   */
  email: string;
  /**
   * date of creation
   */
  createdAt: string;
}>;

export default TUserRepViewModel;
