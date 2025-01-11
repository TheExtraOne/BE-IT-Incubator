import { Request } from "express";

export type TRequestWithBody<T> = Request<{}, {}, T>;
export type TRequestWithParams<T> = Request<T>;
export type TRequestWithParamsAndBody<T, B> = Request<T, {}, B>;
export type TRequestWithQuery<T> = Request<{}, {}, {}, T>;

export type TFieldError = {
  message: string | null;
  field: string | null;
};
export type TAPIErrorResult = {
  errorsMessages: TFieldError[] | null;
};

export type TResponseWithPagination<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};
