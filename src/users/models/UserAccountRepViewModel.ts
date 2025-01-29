import { WithId, OptionalUnlessRequiredId } from "mongodb";

export type TEmailConfirmation = {
  /**
   * confirmationCode of the user, generated with mongo db ObjectId and converted to string
   */
  confirmationCode: string;
  /**
   * expirationDate of the confirmationCode
   */
  expirationDate: Date;
  /**
   * if user confirmed email
   */
  isConfirmed: boolean;
};
type TUserAccountRepViewModel = WithId<{
  accountData: {
    /**
     * userName(login) of the user
     */
    userName: string;
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
  };
  emailConfirmation: TEmailConfirmation;
}>;

export default TUserAccountRepViewModel;
