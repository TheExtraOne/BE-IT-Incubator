import { Response } from "express";
import { TRequestWithBody } from "../types";
import usersService from "../users/users-service";
import { STATUS } from "../settings";
import TAuthControllerInputModel from "./models/AuthControllerInputModel";

const authController = {
  authorizeUser: async (
    req: TRequestWithBody<TAuthControllerInputModel>,
    res: Response
  ) => {
    const { loginOrEmail, password } = req.body;
    const is_correct: boolean = await usersService.checkUserCredentials({
      loginOrEmail,
      password,
    });

    res.sendStatus(
      is_correct ? STATUS.NO_CONTENT_204 : STATUS.UNAUTHORIZED_401
    );
  },
};

export default authController;
