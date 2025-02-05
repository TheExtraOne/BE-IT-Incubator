import { Response } from "express";
import {
  SORT_DIRECTION,
  HTTP_STATUS,
  RESULT_STATUS,
} from "../../common/settings";
import {
  TRequestWithQuery,
  TResponseWithPagination,
  TRequestWithBody,
  TRequestWithParams,
  Result,
} from "../../common/types/types";
import UsersService from "../app/users-service";
import TPathParamsUserModel from "../types/PathParamsUserModel";
import TQueryUserModel from "../types/QueryUserModel";
import TUserControllerInputModel from "../types/UserControllerInputModel";
import TUserControllerViewModel from "../types/UserControllerViewModel";
import TUserServiceViewModel from "../types/UserServiceViewModel";
import UsersQueryRepository from "../infrastructure/users-query-repository";
import UserAccountRepViewModel from "../types/UserAccountRepViewModel";
import { HydratedDocument } from "mongoose";

class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService
  ) {}

  async getUsers(req: TRequestWithQuery<TQueryUserModel>, res: Response) {
    // Validating in the middleware
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
      await this.usersQueryRepository.getAllUsers({
        searchEmailTerm,
        searchLoginTerm,
        sortBy: `accountData.${sortBy}`,
        sortDirection,
        pageNumber: +pageNumber,
        pageSize: +pageSize,
      });

    res.status(HTTP_STATUS.OK_200).json(users);
  }

  async createUser(
    req: TRequestWithBody<TUserControllerInputModel>,
    res: Response
  ) {
    // Validation in middlewares (except check for unique, which is in BLL)
    const { login, email, password } = req.body;
    const result: Result<HydratedDocument<UserAccountRepViewModel> | null> =
      await this.usersService.createUserAccount({
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
    // Confirming user email
    await this.usersService.confirmUserEmail(result.data!);

    const createdUser: TUserControllerViewModel | null =
      this.usersService.mapUser(result.data!);

    res.status(HTTP_STATUS.CREATED_201).json(createdUser);
  }

  async deleteUser(
    req: TRequestWithParams<TPathParamsUserModel>,
    res: Response
  ) {
    const result: Result = await this.usersService.deleteUserById(
      req.params.id
    );

    res.sendStatus(
      result.status === RESULT_STATUS.SUCCESS
        ? HTTP_STATUS.NO_CONTENT_204
        : HTTP_STATUS.NOT_FOUND_404
    );
  }
}

export default UsersController;
