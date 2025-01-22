import { Router } from "express";
import bodyAuthLoginInputValidator from "./middleware/body-auth-login-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../common/middlewares";
import authController from "./auth-controller";
import accessTokenVerificationMiddleware from "../jwt/middleware/access-token-verification-middleware";
import bodyAuthRegistrationInputValidator from "./middleware/body-auth-registration-input-validation-middleware";
import bodyAuthConfirmationInputValidator from "./middleware/body-auth-confirmation-input-validation-middleware";
import refreshTokenVerificationMiddleware from "../jwt/middleware/refresh-token-verification-middleware";

const authRouter = Router({});

const loginMiddleware = [
  bodyAuthLoginInputValidator.loginOrEmailValidation,
  bodyAuthLoginInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];
const registrationMiddleware = [
  bodyAuthRegistrationInputValidator.emailValidation,
  bodyAuthRegistrationInputValidator.loginValidation,
  bodyAuthRegistrationInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];
const confirmationMiddleware = [
  bodyAuthConfirmationInputValidator.confirmationCodeValidation,
  inputCheckErrorsMiddleware,
];
const postEmailResendingInputMiddleware = [
  bodyAuthRegistrationInputValidator.emailValidation,
  inputCheckErrorsMiddleware,
];
const postRefreshTokenCookieMiddleware = [
  refreshTokenVerificationMiddleware,
  inputCheckErrorsMiddleware,
];

authRouter.post("/login", [...loginMiddleware], authController.loginUser);
authRouter.post(
  "/registration",
  [...registrationMiddleware],
  authController.registerUser
);
authRouter.post(
  "/registration-email-resending",
  [...postEmailResendingInputMiddleware],
  authController.resendRegistrationEmail
);
authRouter.post(
  "/registration-confirmation",
  [...confirmationMiddleware],
  authController.confirmRegistration
);
authRouter.post(
  "/refresh-token",
  [...postRefreshTokenCookieMiddleware],
  authController.refreshToken
);
authRouter.post(
  "/logout",
  [...postRefreshTokenCookieMiddleware],
  authController.logoutUser
);
authRouter.get(
  "/me",
  accessTokenVerificationMiddleware,
  authController.getUserInformation
);

export default authRouter;
