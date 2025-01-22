import express, { Request, Response } from "express";
import cors from "cors";
import { SETTINGS, HTTP_STATUS } from "./common/settings";
import blogsRouter from "./blogs/blogs-router";
import postsRouter from "./posts/posts-router";
import usersRouter from "./users/users-router";
import testingRouter from "./testing/testing-router";
import authRouter from "./auth/auth-router";
import commentsRouter from "./comments/comments-router";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK_200).json("All good");
});

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.TESTING, testingRouter);
app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);

export default app;
