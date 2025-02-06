import express, { Request, Response } from "express";
import cors from "cors";
import { SETTINGS, HTTP_STATUS } from "./common/settings";
import commentsRouter from "./features/comments/api/comments-router";
import cookieParser from "cookie-parser";
import authRouter from "./features/auth/api/auth-router";
import blogsRouter from "./features/blogs/api/blogs-router";
import postsRouter from "./features/posts/api/posts-router";
import securityRouter from "./features/security/api/security-router";
import testingRouter from "./testing/api/testing-router";
import usersRouter from "./features/users/api/users-router";

const app = express();
app.set("trust proxy", true);
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
app.use(SETTINGS.PATH.SECURITY, securityRouter);

export default app;
