import express, { Request, Response } from "express";
import cors from "cors";
import { SETTINGS, STATUS } from "./settings";
import {
  blogsRouter,
  postsRouter,
  testingRouter,
  usersRouter,
  authRouter,
} from "./api";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (_req: Request, res: Response) => {
  res.status(STATUS.OK_200).json("All good");
});

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.TESTING, testingRouter);
app.use(SETTINGS.PATH.AUTH, authRouter);

export default app;
