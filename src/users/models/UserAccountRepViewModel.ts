import { ObjectId } from "mongodb";

export type TPasswordResetConfirmation = {
  /**
   * recoveryCode of the user, generated with mongo db ObjectId and converted to string
   */
  recoveryCode: string | null;
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
// type TUserAccountRepViewModel = WithId<{
//   accountData: {
//     /**
//      * userName(login) of the user
//      */
//     userName: string;
//     /**
//      * passwordHash of the user
//      */
//     passwordHash: string;
//     /**
//      * email of the user
//      */
//     email: string;
//     /**
//      * date of creation
//      */
//     createdAt: string;
//   };
//   emailConfirmation: TEmailConfirmation;
//   passwordResetConfirmation: TPasswordResetConfirmation;
// }>;

class UserAccountRepViewModel {
  constructor(
    public _id: ObjectId,
    public accountData: {
      userName: string;
      passwordHash: string;
      email: string;
      createdAt: string;
    },
    public emailConfirmation: TEmailConfirmation,
    public passwordResetConfirmation: TPasswordResetConfirmation
  ) {}
}

export default UserAccountRepViewModel;
