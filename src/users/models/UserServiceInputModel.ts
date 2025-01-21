type TUserServiceInputModel = {
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
   * flag that indicates if the user confirmed his email
   */
  isConfirmed?: boolean;
};

export default TUserServiceInputModel;
