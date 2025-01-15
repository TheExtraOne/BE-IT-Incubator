import { Router } from "express";
import bodyAuthInputValidator from "../middleware/body-auth-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../middleware";
import authController from "./auth-controller";

const authRouter = Router({});

const postAuthMiddleware = [
  bodyAuthInputValidator.loginOrEmailValidation,
  bodyAuthInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];
authRouter.post(
  "/login",
  [...postAuthMiddleware],
  authController.authorizeUser
);

export default authRouter;
