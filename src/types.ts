import { Request } from "express";
import { SORT_DIRECTION } from "./settings";

export type TRequestWithBody<T> = Request<{}, {}, T>;
export type TRequestWithParams<T> = Request<T>;
export type TRequestWithParamsAndBody<T, B> = Request<T, {}, B>;
export type TRequestWithQueryAndParams<T, B> = Request<B, {}, {}, T>;
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

export type TSortDirection = SORT_DIRECTION.ASC | SORT_DIRECTION.DESC;
