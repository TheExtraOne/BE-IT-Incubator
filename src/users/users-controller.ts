import { Response } from "express";
import { SORT_DIRECTION, HTTP_STATUS } from "../common/settings";
import {
  TFieldError,
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithQuery,
  TResponseWithPagination,
} from "../common/types/types";
import usersService from "./users-service";
import TQueryUserModel from "./models/QueryUserModel";
import TUserServiceViewModel from "./models/UserServiceViewModel";
import usersQueryRepository from "./users-query-repository";
import TUserControllerInputModel from "./models/UserControllerInputModel";
import TPathParamsUserModel from "./models/PathParamsUserModel";

type TCreateUserReturnedValue = {
  hasError: boolean;
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

    res.status(HTTP_STATUS.OK_200).json(users);
  },

  createUser: async (
    req: TRequestWithBody<TUserControllerInputModel>,
    res: Response
  ) => {
    // Validation in middlewares (except check for unique, which is in BLL)
    const { login, email, password } = req.body;
    const { hasError, errors, createdUserId }: TCreateUserReturnedValue =
      await usersService.createUser({
        login,
        email,
        password,
      });

    if (hasError) {
      res.status(HTTP_STATUS.BAD_REQUEST_400).json({
        errorsMessages: errors,
      });
      return;
    }

    const createdUser = await usersQueryRepository.getUserById(createdUserId!);

    res.status(HTTP_STATUS.CREATED_201).json(createdUser);
  },

  deleteUser: async (
    req: TRequestWithParams<TPathParamsUserModel>,
    res: Response
  ) => {
    const is_successful: boolean = await usersService.deleteUserById(
      req.params.id
    );

    res.sendStatus(
      is_successful ? HTTP_STATUS.NO_CONTENT_204 : HTTP_STATUS.NOT_FOUND_404
    );
  },
};

export default usersController;
