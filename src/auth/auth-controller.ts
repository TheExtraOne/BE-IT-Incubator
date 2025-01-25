import { Response, Request } from "express";
import usersService from "../users/users-service";
import { HTTP_STATUS, RESULT_STATUS, TOKEN_TYPE } from "../common/settings";
import TAuthLoginControllerInputModel from "./models/AuthLoginControllerInputModel";
import jwtService from "../jwt/jwt-service";
import usersQueryRepository from "../users/users-query-repository";
import TUserControllerViewModel from "../users/models/UserControllerViewModel";
import { Result, TRequestWithBody } from "../common/types/types";
import TAuthRegistrationControllerInputModel from "./models/AuthRegistrationControllerInputModel";
import authService from "./auth-service";

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

    const accessToken: string = await jwtService.createJWT({
      userId: result.data?.id!,
      type: TOKEN_TYPE.AC_TOKEN,
    });
    const refreshToken: string = await jwtService.createJWT({
      userId: result.data?.id!,
      type: TOKEN_TYPE.R_TOKEN,
    });

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    res.status(HTTP_STATUS.OK_200).json({ accessToken });
  },

  logoutUser: async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    // Extracting userId from req <- put it there in the middlewares from access token
    const userId = req.userId;
    // Check if token is in a blacklist
    const isTokenInvalid = await usersService.checkIfTokenIsInInvalidList({
      id: userId!,
      token: refreshToken,
    });
    if (isTokenInvalid) {
      res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
      return;
    }
    // Add old refreshToken to the black list
    usersService
      .updateRefreshTokensInvalidListById({ id: userId!, token: refreshToken })
      .catch((err) => console.log(err));

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
    // Checking expiration of refreshToken in the middlewares
    const refreshToken = req.cookies.refreshToken;
    // Extracting userId from req <- put it there in the middlewares from access token
    const userId = req.userId;

    // Check if token is in a blacklist
    const isTokenInvalid = await usersService.checkIfTokenIsInInvalidList({
      id: userId!,
      token: refreshToken,
    });
    if (isTokenInvalid) {
      res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
      return;
    }

    // Add old refreshToken to the black list of user
    usersService
      .updateRefreshTokensInvalidListById({ id: userId!, token: refreshToken })
      .catch((err) => console.log(err));

    // Generate new tokens
    const newAccessToken: string = await jwtService.createJWT({
      userId: userId!,
      type: TOKEN_TYPE.AC_TOKEN,
    });
    const newRefreshToken: string = await jwtService.createJWT({
      userId: userId!,
      type: TOKEN_TYPE.R_TOKEN,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(HTTP_STATUS.OK_200).json({ accessToken: newAccessToken });
  },
};

export default authController;
