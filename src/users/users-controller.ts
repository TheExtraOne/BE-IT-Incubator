import { Response } from "express";
import { SORT_DIRECTION, HTTP_STATUS, RESULT_STATUS } from "../common/settings";
import {
  Result,
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithQuery,
  TResponseWithPagination,
} from "../common/types/types";
import UsersService from "./users-service";
import TQueryUserModel from "./models/QueryUserModel";
import TUserServiceViewModel from "./models/UserServiceViewModel";
import UsersQueryRepository from "./users-query-repository";
import TUserControllerInputModel from "./models/UserControllerInputModel";
import TPathParamsUserModel from "./models/PathParamsUserModel";
import TUserControllerViewModel from "./models/UserControllerViewModel";

class UsersController {
  private usersQueryRepository: UsersQueryRepository;
  private usersService: UsersService;

  constructor() {
    this.usersQueryRepository = new UsersQueryRepository();
    this.usersService = new UsersService();
  }

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
    const result: Result<string | null> =
      await this.usersService.createUserAccount({
        login,
        email,
        password,
        isConfirmed: true,
      });

    if (result.status !== RESULT_STATUS.SUCCESS) {
      res.status(HTTP_STATUS.BAD_REQUEST_400).json({
        errorsMessages: result.extensions,
      });
      return;
    }

    const createdUser: TUserControllerViewModel | null =
      await this.usersQueryRepository.getUserById(result.data!);

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
