import { Router } from "express";
import bodyAuthLoginInputValidator from "./middleware/body-auth-login-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../common/middlewares";
import authController from "./auth-controller";
import accessTokenVerificationMiddleware from "../adapters/middleware/access-token-verification-middleware";
import bodyAuthRegistrationInputValidator from "./middleware/body-auth-registration-input-validation-middleware";
import bodyAuthConfirmationInputValidator from "./middleware/body-auth-confirmation-input-validation-middleware";
import refreshTokenVerificationMiddleware from "../adapters/middleware/refresh-token-verification-middleware";
import rateLimitingMiddleware from "../rate-limiting/middleware/rate-limiting-middleware";

const authRouter = Router({});

const loginMiddleware = [
  rateLimitingMiddleware,
  bodyAuthLoginInputValidator.loginOrEmailValidation,
  bodyAuthLoginInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];
const registrationMiddleware = [
  rateLimitingMiddleware,
  bodyAuthRegistrationInputValidator.emailValidation,
  bodyAuthRegistrationInputValidator.loginValidation,
  bodyAuthRegistrationInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];
const confirmationMiddleware = [
  rateLimitingMiddleware,
  bodyAuthConfirmationInputValidator.confirmationCodeValidation,
  inputCheckErrorsMiddleware,
];
const postEmailResendingInputMiddleware = [
  rateLimitingMiddleware,
  bodyAuthRegistrationInputValidator.emailValidation,
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
  refreshTokenVerificationMiddleware,
  authController.refreshToken
);
authRouter.post(
  "/logout",
  refreshTokenVerificationMiddleware,
  authController.logoutUser
);
authRouter.get(
  "/me",
  accessTokenVerificationMiddleware,
  authController.getUserInformation
);

export default authRouter;
