import { Router, Request, Response, NextFunction } from "express";
import usersController from "./users-controller";
import bodyUserInputValidator from "../middleware/body-user-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../middleware";

const usersRouter = Router({});

const getAllUsersMiddleware: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [];
const createUserMiddleWare = [
  bodyUserInputValidator.emailValidator,
  bodyUserInputValidator.loginValidation,
  bodyUserInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];
const deleteUserMiddleWare: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [];

usersRouter.get("/", [...getAllUsersMiddleware], usersController.getUsers);
usersRouter.post("/", [...createUserMiddleWare], usersController.createUser);
usersRouter.delete(
  "/:id",
  [...deleteUserMiddleWare],
  usersController.deleteUser
);

export default usersRouter;
