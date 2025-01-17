import { Response } from "express";
import { SORT_DIRECTION, STATUS } from "../settings";
import {
  TFieldError,
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithQuery,
  TResponseWithPagination,
} from "../types";
import {
  TPathParamsUserModel,
  TQueryUserModel,
  TUserControllerInputModel,
} from "./models";
import usersService from "../business-logic/users-service";
import { TUserServiceViewModel } from "../business-logic/models";
import usersQueryRepository from "../data-access/query-repository/users-query-repository";

type TCreateUserReturnedValue = {
  has_error: boolean;
  errors: TFieldError[] | [];
  createdUserId: null | string;
};

const usersController = {
  getUsers: async (req: TRequestWithQuery<TQueryUserModel>, res: Response) => {
    const {
      searchEmailTerm = null,
      searchLoginTerm = null,
      sortBy = "createdAt",
      sortDirection = SORT_DIRECTION.DESC,
      pageNumber = 1,
      pageSize = 10,
    } = req.query;
    // We are reaching out to usersQueryRepository directly because of CQRS
    const users: TResponseWithPagination<TUserServiceViewModel[] | []> =
      await usersQueryRepository.getAllUsers({
        searchEmailTerm,
        searchLoginTerm,
        sortBy,
        sortDirection,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
      });

    res.status(STATUS.OK_200).json(users);
  },

  createUser: async (
    req: TRequestWithBody<TUserControllerInputModel>,
    res: Response
  ) => {
    // Validation in middlewares (except check for unique, which is in BLL)
    const { login, email, password } = req.body;
    const { has_error, errors, createdUserId }: TCreateUserReturnedValue =
      await usersService.createUser({
        login,
        email,
        password,
      });

    if (has_error) {
      res.status(STATUS.BAD_REQUEST_400).json({
        errorsMessages: errors,
      });
      return;
    }

    const createdUser = await usersQueryRepository.getUserById(
      createdUserId ?? ""
    );

    res.status(STATUS.CREATED_201).json(createdUser);
  },

  deleteUser: async (
    req: TRequestWithParams<TPathParamsUserModel>,
    res: Response
  ) => {
    const is_successful: boolean = await usersService.deleteUserById(
      req.params.id
    );

    res.sendStatus(
      is_successful ? STATUS.NO_CONTENT_204 : STATUS.NOT_FOUND_404
    );
  },
};

export default usersController;
