import { Router, Request, Response } from "express";
import { db } from "../db/db";
import { STATUS } from "../settings";

export const testingRouter = Router({});

testingRouter.delete("/all-data", (_req: Request, res: Response) => {
  db.videos = [];
  res.sendStatus(STATUS.NO_CONTENT_204);
});
