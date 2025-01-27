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
import { v4 as uuidv4 } from "uuid";

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
    const deviceId = uuidv4();
    const accessToken: string = await jwtService.createJWT({
      payload: { userId },
      type: TOKEN_TYPE.AC_TOKEN,
    });
    const refreshToken: string = await jwtService.createJWT({
      payload: { userId, deviceId },
      type: TOKEN_TYPE.R_TOKEN,
    });

    // Creating refreshTokenMeta without waiting
    await securityService.createRefreshTokenMeta({
      refreshToken,
      title:
        req.headers["user-agent"] ||
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      ip: req.ip || "::1",
      deviceId,
    });

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    res.status(HTTP_STATUS.OK_200).json({ accessToken });
  },

  logoutUser: async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const result = await jwtService.decodeToken(refreshToken);
    const { deviceId } = result.data || {};

    securityService.deleteRefreshTokenMetaByDeviceId(deviceId!);

    res.clearCookie("refreshToken", { path: "/" });
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },

  getUserInformation: async (req: Request, res: Response) => {
    const userId = req.userId;
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

  refreshToken: async (req: Request, res: Response) => {
    // Checking expiration and validity of the refreshToken in the middlewares
    const refreshToken = req.cookies.refreshToken;

    const resultDecode = await jwtService.decodeToken(refreshToken);
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

    const resultDecodeNewRefreshToken = await jwtService.decodeToken(
      newRefreshToken
    );
    const { iat } = resultDecodeNewRefreshToken?.data || {};
    // Update time
    securityService.updateRefreshTokenMetaTime({
      deviceId: deviceId!,
      lastActiveDate: securityService.convertTimeToISOFromUnix(iat!),
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(HTTP_STATUS.OK_200).json({ accessToken: newAccessToken });
  },
};

export default authController;
