import { Response, Request } from "express";
import usersService from "../users/users-service";
import { HTTP_STATUS, RESULT_STATUS, TOKEN_TYPE } from "../common/settings";
import TAuthLoginControllerInputModel from "./models/AuthLoginControllerInputModel";
import jwtService from "../adapters/jwt-service";
import usersQueryRepository from "../users/users-query-repository";
import TUserControllerViewModel from "../users/models/UserControllerViewModel";
import { Result, TRequestWithBody } from "../common/types/types";
import TAuthRegistrationControllerInputModel from "./models/AuthRegistrationControllerInputModel";
import authService from "./auth-service";
import securityService from "../security/security-service";
import { ObjectId } from "mongodb";
import TAuthNewPasswordControllerInputModel from "./models/AuthNewPasswordControllerInputModel";

const authController = {
  loginUser: async (
    req: TRequestWithBody<TAuthLoginControllerInputModel>,
    res: Response
  ) => {
    // Login/mail and password validation is in the middleware
    const { loginOrEmail, password } = req.body;
    const result: Result<TUserControllerViewModel | null> =
      await usersService.checkUserCredentials({
        loginOrEmail,
        password,
      });

    if (result.status !== RESULT_STATUS.SUCCESS) {
      res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
      return;
    }

    const userId = result.data?.id!;
    const deviceId = new ObjectId();
    const accessToken: string = await jwtService.createJWT({
      payload: { userId },
      type: TOKEN_TYPE.AC_TOKEN,
    });
    const refreshToken: string = await jwtService.createJWT({
      payload: { userId, deviceId: deviceId.toString() },
      type: TOKEN_TYPE.R_TOKEN,
    });

    await securityService.createRefreshTokenMeta({
      refreshToken,
      title: req.headers["user-agent"] || "Unknown device",
      ip: req.ip || "::1",
      deviceId,
    });

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    res.status(HTTP_STATUS.OK_200).json({ accessToken });
  },

  recoverPassword: async (
    req: TRequestWithBody<{ email: string }>,
    res: Response
  ) => {
    const { email } = req.body;
    await authService.recoverPassword(email);

    // Even if current email is not registered (for prevent user's email detection) we are returning 204
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },

  logoutUser: async (req: Request, res: Response) => {
    // Validate refreshToken and its presence in the middleware
    const refreshToken: string = req.cookies.refreshToken;
    const result: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await jwtService.decodeToken(refreshToken);
    const { deviceId } = result.data || {};

    securityService.deleteRefreshTokenMetaByDeviceId(deviceId!);

    res.clearCookie("refreshToken", { path: "/" });
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },

  getUserInformation: async (req: Request, res: Response) => {
    // Validating userId and it's presence in the middleware
    const userId: string | null = req.userId;
    const user: TUserControllerViewModel | null =
      await usersQueryRepository.getUserById(userId!);

    if (!user) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    res.status(HTTP_STATUS.OK_200).json({
      email: user.email,
      login: user.login,
      userId: user.id,
    });
  },

  registerUser: async (
    req: TRequestWithBody<TAuthRegistrationControllerInputModel>,
    res: Response
  ) => {
    const { login, email, password } = req.body;

    const result: Result<string | null> = await authService.registerUser({
      login,
      email,
      password,
    });
    if (result.status !== RESULT_STATUS.SUCCESS) {
      res.status(HTTP_STATUS.BAD_REQUEST_400).json({
        errorsMessages: result.extensions,
      });
      return;
    }

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },

  resendRegistrationEmail: async (
    req: TRequestWithBody<{ email: string }>,
    res: Response
  ) => {
    const { email } = req.body;
    const result: Result<string | null> =
      await authService.resendRegistrationEmail(email);
    if (result.status !== RESULT_STATUS.SUCCESS) {
      res
        .status(HTTP_STATUS.BAD_REQUEST_400)
        .json({ errorsMessages: result.extensions });
      return;
    }

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },

  confirmRegistration: async (
    req: TRequestWithBody<{ code: string }>,
    res: Response
  ) => {
    const { code: confirmationCode } = req.body;
    const result: Result = await authService.confirmRegistration(
      confirmationCode
    );
    if (result.status !== RESULT_STATUS.SUCCESS) {
      res
        .status(HTTP_STATUS.BAD_REQUEST_400)
        .json({ errorsMessages: result.extensions });
      return;
    }
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },

  setNewPassword: async (
    req: TRequestWithBody<TAuthNewPasswordControllerInputModel>,
    res: Response
  ) => {
    // Validation in the middlewares
    // Check if recovery code is correct in the BLL
    const { newPassword, recoveryCode } = req.body;
    const result: Result = await authService.setNewPassword(
      newPassword,
      recoveryCode
    );
    if (result.status !== RESULT_STATUS.SUCCESS) {
      res
        .status(HTTP_STATUS.BAD_REQUEST_400)
        .json({ errorsMessages: result.extensions });
      return;
    }
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },

  refreshToken: async (req: Request, res: Response) => {
    // Checking expiration and validity of the refreshToken in the middlewares
    const refreshToken: string = req.cookies.refreshToken;

    const resultDecode: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await jwtService.decodeToken(refreshToken);
    const { userId, deviceId } = resultDecode?.data || {};

    // Generate new tokens
    const newAccessToken: string = await jwtService.createJWT({
      payload: { userId: userId! },
      type: TOKEN_TYPE.AC_TOKEN,
    });
    const newRefreshToken: string = await jwtService.createJWT({
      payload: { userId: userId!, deviceId: deviceId! },
      type: TOKEN_TYPE.R_TOKEN,
    });

    const resultDecodeNewRefreshToken: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await jwtService.decodeToken(newRefreshToken);
    const { iat, exp } = resultDecodeNewRefreshToken?.data || {};
    // Update time
    securityService.updateRefreshTokenMetaTime({
      deviceId: deviceId!,
      lastActiveDate: securityService.convertTimeToISOFromUnix(iat!),
      expirationDate: securityService.convertTimeToISOFromUnix(exp!),
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(HTTP_STATUS.OK_200).json({ accessToken: newAccessToken });
  },
};

export default authController;
