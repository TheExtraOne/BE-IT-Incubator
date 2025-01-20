import { config } from "dotenv";
config();

export const SETTINGS = {
  ADMIN_CREDENTIALS: process.env.LOGIN_PASSWORD || "admin:qwerty",
  PORT: process.env.PORT || 3003,
  PATH: {
    BLOGS: "/blogs",
    POSTS: "/posts",
    USERS: "/users",
    TESTING: "/testing",
    AUTH: "/auth",
    COMMENTS: "/comments",
  },
  DB_NAME: "blogs_and_posts",
  COLLECTION_NAMES: {
    BLOGS: "blogs",
    POSTS: "posts",
    USERS: "users",
    COMMENTS: "comments",
  },
  MONGO_URL: process.env.MONGO_URL || "mongodb://0.0.0.0:27017",
  JWT_SECRET: process.env.JWT_SECRET || "123Secret",
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
  SUCCESS = "success",
  NOT_FOUND = "notFound",
  FORBIDDEN = "forbidden",
  UNAUTHORIZED = "unauthorized",
  BAD_REQUEST = "badRequest",
}
