import { Router } from "express";
import bodyAuthInputValidator from "./middleware/body-auth-input-validation-middleware";
import { inputCheckErrorsMiddleware } from "../common/middlewares";
import authController from "./auth-controller";
import authJwtMiddleware from "../jwt/middleware/auth-jwt-middleware";

const authRouter = Router({});

const postAuthMiddleware = [
  bodyAuthInputValidator.loginOrEmailValidation,
  bodyAuthInputValidator.passwordValidation,
  inputCheckErrorsMiddleware,
];

authRouter.post("/login", [...postAuthMiddleware], authController.loginUser);
authRouter.get("/me", authJwtMiddleware, authController.getUserInformation);

export default authRouter;
