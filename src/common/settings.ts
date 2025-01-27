import { config } from "dotenv";
config();

export const SETTINGS = {
  ADMIN_CREDENTIALS: process.env.LOGIN_PASSWORD as string,
  PORT: process.env.PORT || 3003,
  PATH: {
    BLOGS: "/blogs",
    POSTS: "/posts",
    USERS: "/users",
    TESTING: "/testing",
    AUTH: "/auth",
    COMMENTS: "/comments",
    SECURITY: "/security",
  },
  DB_NAME: "blogs_and_posts",
  COLLECTION_NAMES: {
    BLOGS: "blogs",
    POSTS: "posts",
    USERS: "users",
    COMMENTS: "comments",
    REFRESH_TOKENS_META: "refresh_tokens_meta",
  },
  MONGO_URL: process.env.MONGO_URL || "mongodb://0.0.0.0:27017",
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRY: process.env.JWT_EXPIRY as string,
  AC_SECRET: process.env.AC_SECRET as string,
  AC_EXPIRY: process.env.AC_EXPIRY as string,
  RT_SECRET: process.env.RT_SECRET as string,
  RT_EXPIRY: process.env.RT_EXPIRY as string,
  MAIL_PASSWORD: process.env.MAIL_RU_PASS as string,
};

export const HTTP_STATUS = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,
  BAD_REQUEST_400: 400,
  NOT_FOUND_404: 404,
  UNAUTHORIZED_401: 401,
  FORBIDDEN_403: 403,
  SERVER_ERROR_500: 500,
};

export enum SORT_DIRECTION {
  ASC = "asc",
  DESC = "desc",
}

export enum RESULT_STATUS {
  SUCCESS = "SUCCESS",
  NOT_FOUND = "NOT_FOUND",
  FORBIDDEN = "FORBIDDEN",
  UNAUTHORIZED = "UNAUTHORIZED",
  BAD_REQUEST = "BAD_REQUEST",
}

export enum TOKEN_TYPE {
  AC_TOKEN = "AC_TOKEN",
  R_TOKEN = "REFRESH_TOKEN",
}
