import { Router, Request, Response } from "express";
import { HTTP_STATUS } from "../common/settings";
import testingRepository from "./testing-repository";

const testingRouter = Router({});

const testingController = {
  deleteAll: async (_req: Request, res: Response) => {
    await testingRepository.deleteAllData();

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  },
};

testingRouter.delete("/all-data", testingController.deleteAll);

export default testingRouter;
