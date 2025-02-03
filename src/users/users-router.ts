import { Router } from "express";
import bodyUserInputValidator from "./middleware/body-user-input-validation-middleware";
import {
  basicAuthorizationMiddleware,
  inputCheckErrorsMiddleware,
  queryInputValidator,
} from "../common/middlewares";
import { usersController } from "../composition-root";

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
