import { Router } from "express";
import bodyUserInputValidator from "../middleware/body-user-input-validation-middleware";
import UsersController from "./users-controller";
import {
  basicAuthorizationMiddleware,
  queryInputValidator,
  inputCheckErrorsMiddleware,
} from "../../../common/middlewares";
import { container } from "../../../composition-root";

const usersRouter = Router({});
const usersController = container.get<UsersController>("UsersController");

const getAllUsersMiddleware = [
  basicAuthorizationMiddleware,
  queryInputValidator.pageNumberValidator,
  queryInputValidator.pageSizeValidator,
  queryInputValidator.searchEmailTermValidator,
  queryInputValidator.searchLoginTermValidator,
  queryInputValidator.sortByValidator,
  queryInputValidator.sortDirectionValidator,
  inputCheckErrorsMiddleware,
];
const createUserMiddleWare = [
  basicAuthorizationMiddleware,
  bodyUserInputValidator.emailValidator,
  bodyUserInputValidator.loginValidation,
  bodyUserInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];

usersRouter
  .route("/")
  .get(
    [...getAllUsersMiddleware],
    usersController.getUsers.bind(usersController)
  )
  .post(
    [...createUserMiddleWare],
    usersController.createUser.bind(usersController)
  );

usersRouter.delete(
  "/:id",
  basicAuthorizationMiddleware,
  usersController.deleteUser.bind(usersController)
);

export default usersRouter;
