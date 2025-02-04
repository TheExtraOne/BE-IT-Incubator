import { Response, Request } from "express";
import TAuthLoginControllerInputModel from "../domain/AuthLoginControllerInputModel";
import TAuthRegistrationControllerInputModel from "../domain/AuthRegistrationControllerInputModel";
import AuthService from "../infrastructure/auth-service";
import { ObjectId } from "mongodb";
import TAuthNewPasswordControllerInputModel from "../domain/AuthNewPasswordControllerInputModel";
import JwtService from "../../adapters/jwt-service";
import { RESULT_STATUS, HTTP_STATUS, TOKEN_TYPE } from "../../common/settings";
import { Result, TRequestWithBody } from "../../common/types/types";
import SecurityService from "../../security/app/security-service";
import TUserControllerViewModel from "../../users/domain/UserControllerViewModel";
import UsersService from "../../users/app/users-service";
import UsersQueryRepository from "../../users/infrastructure/users-query-repository";

class AuthController {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
    private securityService: SecurityService
  ) {}

  async loginUser(
    req: TRequestWithBody<TAuthLoginControllerInputModel>,
    res: Response
  ) {
    // Login/mail and password validation is in the middleware
    const { loginOrEmail, password } = req.body;
    const result: Result<TUserControllerViewModel | null> =
      await this.usersService.checkUserCredentials({
        loginOrEmail,
        password,
      });

    if (result.status !== RESULT_STATUS.SUCCESS) {
      res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
      return;
    }

    const userId = result.data?.id!;
    const deviceId = new ObjectId();
    const accessToken: string = await this.jwtService.createToken({
      payload: { userId },
      type: TOKEN_TYPE.AC_TOKEN,
    });
    const refreshToken: string = await this.jwtService.createToken({
      payload: { userId, deviceId: deviceId.toString() },
      type: TOKEN_TYPE.R_TOKEN,
    });

    await this.securityService.createRefreshTokenMeta({
      refreshToken,
      title: req.headers["user-agent"] || "Unknown device",
      ip: req.ip || "::1",
      deviceId,
    });

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    res.status(HTTP_STATUS.OK_200).json({ accessToken });
  }

  async recoverPassword(
    req: TRequestWithBody<{ email: string }>,
    res: Response
  ) {
    const { email } = req.body;
    await this.authService.recoverPassword(email);

    // Even if current email is not registered (for prevent user's email detection) we are returning 204
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async logoutUser(req: Request, res: Response) {
    // Validate refreshToken and its presence in the middleware
    const refreshToken: string = req.cookies.refreshToken;
    const result: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await this.jwtService.decodeToken(refreshToken);
    const { deviceId } = result.data || {};

    this.securityService.deleteRefreshTokenMetaByDeviceId(deviceId!);

    res.clearCookie("refreshToken", { path: "/" });
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async getUserInformation(req: Request, res: Response) {
    // Validating userId and it's presence in the middleware
    const userId: string | null = req.userId;
    const user: TUserControllerViewModel | null =
      await this.usersQueryRepository.getUserById(userId!);

    if (!user) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    res.status(HTTP_STATUS.OK_200).json({
      email: user.email,
      login: user.login,
      userId: user.id,
    });
  }

  async registerUser(
    req: TRequestWithBody<TAuthRegistrationControllerInputModel>,
    res: Response
  ) {
    const { login, email, password } = req.body;

    const result: Result<string | null> = await this.authService.registerUser({
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
  }

  async resendRegistrationEmail(
    req: TRequestWithBody<{ email: string }>,
    res: Response
  ) {
    const { email } = req.body;
    const result: Result<string | null> =
      await this.authService.resendRegistrationEmail(email);
    if (result.status !== RESULT_STATUS.SUCCESS) {
      res
        .status(HTTP_STATUS.BAD_REQUEST_400)
        .json({ errorsMessages: result.extensions });
      return;
    }

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async confirmRegistration(
    req: TRequestWithBody<{ code: string }>,
    res: Response
  ) {
    const { code: confirmationCode } = req.body;
    const result: Result = await this.authService.confirmRegistration(
      confirmationCode
    );
    if (result.status !== RESULT_STATUS.SUCCESS) {
      res
        .status(HTTP_STATUS.BAD_REQUEST_400)
        .json({ errorsMessages: result.extensions });
      return;
    }
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async setNewPassword(
    req: TRequestWithBody<TAuthNewPasswordControllerInputModel>,
    res: Response
  ) {
    // Validation in the middlewares
    // Check if recovery code is correct in the BLL
    const { newPassword, recoveryCode } = req.body;
    const result: Result = await this.authService.setNewPassword(
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
  }

  async refreshToken(req: Request, res: Response) {
    // Checking expiration and validity of the refreshToken in the middlewares
    const refreshToken: string = req.cookies.refreshToken;

    const resultDecode: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await this.jwtService.decodeToken(refreshToken);
    const { userId, deviceId } = resultDecode?.data || {};

    // Generate new tokens
    const newAccessToken: string = await this.jwtService.createToken({
      payload: { userId: userId! },
      type: TOKEN_TYPE.AC_TOKEN,
    });
    const newRefreshToken: string = await this.jwtService.createToken({
      payload: { userId: userId!, deviceId: deviceId! },
      type: TOKEN_TYPE.R_TOKEN,
    });

    const resultDecodeNewRefreshToken: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await this.jwtService.decodeToken(newRefreshToken);
    const { iat, exp } = resultDecodeNewRefreshToken?.data || {};
    // Update time
    this.securityService.updateRefreshTokenMetaTime({
      deviceId: deviceId!,
      lastActiveDate: this.securityService.convertTimeToISOFromUnix(iat!),
      expirationDate: this.securityService.convertTimeToISOFromUnix(exp!),
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(HTTP_STATUS.OK_200).json({ accessToken: newAccessToken });
  }
}

export default AuthController;
