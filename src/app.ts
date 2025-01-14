import express, { Request, Response } from "express";
import cors from "cors";
import { SETTINGS, STATUS } from "./settings";
import blogsRouter from "./api/blogs-router";
import postsRouter from "./api/posts-router";
import testingRouter from "./api/testing";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (_req: Request, res: Response) => {
  res.status(STATUS.OK_200).json("All good");
});

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.TESTING, testingRouter);

export default app;
