import { Response, Request } from "express";
import usersService from "../users/users-service";
import { HTTP_STATUS, RESULT_STATUS } from "../common/settings";
import TAuthControllerInputModel from "./models/AuthControllerInputModel";
import TUserRepViewModel from "../users/models/UserRepViewModel";
import jwtService from "../jwt/jwt-service";
import usersQueryRepository from "../users/users-query-repository";
import TUserControllerViewModel from "../users/models/UserControllerViewModel";
import { Result, TRequestWithBody } from "../common/types/types";

const authController = {
  loginUser: async (
    req: TRequestWithBody<TAuthControllerInputModel>,
    res: Response
  ) => {
    const { loginOrEmail, password } = req.body;
    const result: Result<TUserRepViewModel | null> =
      await usersService.checkUserCredentials({
        loginOrEmail,
        password,
      });

    if (result.status !== RESULT_STATUS.SUCCESS) {
      res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
      return;
    }

    const token: string = await jwtService.createJWT(result.data!);
    res.status(HTTP_STATUS.OK_200).json({
      accessToken: token,
    });
  },

  getUserInformation: async (req: Request, res: Response) => {
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
};

export default authController;
