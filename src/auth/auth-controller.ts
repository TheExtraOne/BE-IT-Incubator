import { Response, Request } from "express";
import usersService from "../users/users-service";
import { STATUS } from "../settings";
import TAuthControllerInputModel from "./models/AuthControllerInputModel";
import TUserRepViewModel from "../users/models/UserRepViewModel";
import jwtService from "../jwt/jwt-service";
import { TRequestWithBody } from "../types/types";
import usersQueryRepository from "../users/users-query-repository";
import TUserControllerViewModel from "../users/models/UserControllerViewModel";

const authController = {
  authorizeUser: async (
    req: TRequestWithBody<TAuthControllerInputModel>,
    res: Response
  ) => {
    const { loginOrEmail, password } = req.body;
    const {
      user,
      hasError,
    }: { user: TUserRepViewModel | null; hasError: boolean } =
      await usersService.checkUserCredentials({
        loginOrEmail,
        password,
      });

    if (hasError) {
      res.sendStatus(STATUS.UNAUTHORIZED_401);
      return;
    }

    const token: string = await jwtService.createJWT(user!);
    res.status(STATUS.OK_200).send({
      accessToken: token,
    });
  },

  getUserInformation: async (req: Request, res: Response) => {
    const userId: string | null = req.userId;
    const user: TUserControllerViewModel | null =
      await usersQueryRepository.getUserById(userId!);

    res.status(STATUS.OK_200).send({
      email: user?.email,
      login: user?.login,
      userId: user?.id,
    });
  },
};

export default authController;
