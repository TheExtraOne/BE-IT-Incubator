import { WithId, OptionalUnlessRequiredId } from "mongodb";

export type TPasswordResetConfirmation = {
  /**
   * confirmationCode of the user, generated with mongo db ObjectId and converted to string
   */
  confirmationCode: string | null;
  /**
   * expirationDate of the confirmationCode
   */
  expirationDate: Date | null;
  /**
   * if user confirmed email
   */
  isConfirmed: boolean | null;
};

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
  passwordResetConfirmation: TPasswordResetConfirmation;
}>;

export default TUserAccountRepViewModel;
