import { WithId, OptionalUnlessRequiredId } from "mongodb";

type TUserRepViewModel = WithId<{
  /**
   * login of the user
   */
  login: string;
  /**
   * password of the user
   */
  password: string;
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
