import { Router, Request, Response } from "express";
import { STATUS } from "../settings";
import testingRepository from "../repository/testing-repository";

const testingRouter = Router({});

const testingController = {
  deleteAll: (_req: Request, res: Response) => {
    testingRepository.deleteAllData();

    res.sendStatus(STATUS.NO_CONTENT_204);
  },
};

testingRouter.delete("/all-data", testingController.deleteAll);

export default testingRouter;
