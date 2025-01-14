import { Request, Response } from "express";
import { SORT_DIRECTION, STATUS } from "../settings";
import { TRequestWithBody } from "../types";
import { TUserControllerInputModel, TUserControllerViewModel } from "./models";
import usersService from "../business-logic/users-service";

const usersController = {
  getUsers: async (_req: Request, res: Response) => {
    const users: TUserControllerViewModel[] | [] =
      await usersService.getAllUsers();

    res.status(STATUS.OK_200).json(users);
  },

  createUser: async (
    req: TRequestWithBody<TUserControllerInputModel>,
    res: Response
  ) => {
    // Validation in middlewares (except check for unique, which is in BLL)
    const { login, email, password } = req.body;
    const createdUser: TUserControllerViewModel = await usersService.createUser(
      {
        login,
        email,
        password,
      }
    );

    res.status(STATUS.CREATED_201).json(createdUser);
  },

  deleteUser: async (_req: Request, res: Response) => {
    // TODO
    res.sendStatus(STATUS.NO_CONTENT_204);
  },
};

export default usersController;
