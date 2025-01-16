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
   * email of the user
   */
  email: string;
  /**
   * date of creation
   */
  createdAt: string;
}>;

export default TUserRepViewModel;
