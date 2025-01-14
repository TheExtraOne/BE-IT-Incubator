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
  },
  DB_NAME: "blogs_and_posts",
  COLLECTION_NAMES: {
    BLOGS: "blogs",
    POSTS: "posts",
    USERS: "users",
  },
  MONGO_URL: process.env.MONGO_URL || "mongodb://0.0.0.0:27017",
};

export const STATUS = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,
  BAD_REQUEST_400: 400,
  NOT_FOUND_404: 404,
  UNAUTHORIZED_401: 401,
};

export enum SORT_DIRECTION {
  ASC = "asc",
  DESC = "desc",
}
