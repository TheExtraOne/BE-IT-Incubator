import { Router } from "express";
import bodyAuthLoginInputValidator from "./middleware/body-auth-login-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../common/middlewares";
import authController from "./auth-controller";
import authJwtMiddleware from "../jwt/middleware/auth-jwt-middleware";
import bodyAuthRegistrationInputValidator from "./middleware/body-auth-registration-input-validation-middleware";

const authRouter = Router({});

const postLoginMiddleware = [
  bodyAuthLoginInputValidator.loginOrEmailValidation,
  bodyAuthLoginInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];

const postRegistrationMiddleware = [
  bodyAuthRegistrationInputValidator.emailValidation,
  bodyAuthRegistrationInputValidator.loginValidation,
  bodyAuthRegistrationInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];

authRouter.post("/login", [...postLoginMiddleware], authController.loginUser);
authRouter.post(
  "/registration",
  [...postRegistrationMiddleware],
  authController.registerUser
);
authRouter.get("/me", authJwtMiddleware, authController.getUserInformation);

export default authRouter;
