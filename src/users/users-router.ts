import { Router } from "express";
import usersController from "./users-controller";
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

usersRouter.get("/", [...getAllUsersMiddleware], usersController.getUsers);
usersRouter.post("/", [...createUserMiddleWare], usersController.createUser);
usersRouter.delete(
  "/:id",
  basicAuthorizationMiddleware,
  usersController.deleteUser
);

export default usersRouter;
