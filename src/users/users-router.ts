import { Router } from "express";
import usersController from "./users-controller";
import bodyUserInputValidator from "./middleware/body-user-input-validation-middleware";
import {
  basicAuthorizationMiddleware,
  inputCheckErrorsMiddleware,
  queryInputValidator,
} from "../common-middleware";

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
const deleteUserMiddleWare = [basicAuthorizationMiddleware];

usersRouter.get("/", [...getAllUsersMiddleware], usersController.getUsers);
usersRouter.post("/", [...createUserMiddleWare], usersController.createUser);
usersRouter.delete(
  "/:id",
  [...deleteUserMiddleWare],
  usersController.deleteUser
);

export default usersRouter;
