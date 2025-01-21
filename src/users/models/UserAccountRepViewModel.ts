import { WithId, OptionalUnlessRequiredId } from "mongodb";

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
  emailConfirmation: {
    /**
     * confirmationCode of the user, generated with uuid
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
}>;

export default TUserAccountRepViewModel;
