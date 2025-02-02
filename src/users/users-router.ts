import { Router } from "express";
import UsersController from "./users-controller";
import bodyUserInputValidator from "./middleware/body-user-input-validation-middleware";
import {
  basicAuthorizationMiddleware,
  inputCheckErrorsMiddleware,
  queryInputValidator,
} from "../common/middlewares";

const usersRouter = Router({});

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

const usersController = new UsersController();

usersRouter.get(
  "/",
  [...getAllUsersMiddleware],
  usersController.getUsers.bind(usersController)
);
usersRouter.post(
  "/",
  [...createUserMiddleWare],
  usersController.createUser.bind(usersController)
);
usersRouter.delete(
  "/:id",
  basicAuthorizationMiddleware,
  usersController.deleteUser.bind(usersController)
);

export default usersRouter;
