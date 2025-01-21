import { Router } from "express";
import bodyAuthLoginInputValidator from "./middleware/body-auth-login-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../common/middlewares";
import authController from "./auth-controller";
import authJwtMiddleware from "../jwt/middleware/auth-jwt-middleware";
import bodyAuthRegistrationInputValidator from "./middleware/body-auth-registration-input-validation-middleware";
import bodyAuthConfirmationInputValidator from "./middleware/body-auth-confirmation-input-validation-middleware";

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
const postConfirmationInputMiddleware = [
  bodyAuthConfirmationInputValidator.confirmationCodeValidation,
  inputCheckErrorsMiddleware,
];

authRouter.post("/login", [...postLoginMiddleware], authController.loginUser);
authRouter.post(
  "/registration",
  [...postRegistrationMiddleware],
  authController.registerUser
);
authRouter.post(
  "/registration-confirmation",
  [...postConfirmationInputMiddleware],
  authController.confirmRegistration
);
authRouter.get("/me", authJwtMiddleware, authController.getUserInformation);

export default authRouter;
