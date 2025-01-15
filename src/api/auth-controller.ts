import { Response } from "express";
import { TRequestWithBody } from "../types";
import { TAuthControllerInputModel } from "./models";
import usersService from "../business-logic/users-service";
import { STATUS } from "../settings";

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
