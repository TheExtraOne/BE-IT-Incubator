import { Request } from "express";
import { RESULT_STATUS } from "../settings";

export type TRequestWithBody<T> = Request<{}, {}, T>;
export type TRequestWithParams<T> = Request<T>;
export type TRequestWithParamsAndBody<T, B> = Request<T, {}, B>;
export type TRequestWithQueryAndParams<T, B> = Request<B, {}, {}, T>;
export type TRequestWithQuery<T> = Request<{}, {}, {}, T>;

export type TAPIErrorResult = {
  errorsMessages: TExtension[] | null;
};

export type TResponseWithPagination<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export type TExtension = {
  field: string | null;
  message: string;
};

export type Result<T = null> = {
  status: RESULT_STATUS;
  errorMessage?: string;
  extensions: TExtension[];
  data: T;
};
