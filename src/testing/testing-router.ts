import { Router, Request, Response } from "express";
import { HTTP_STATUS } from "../common/settings";
import testingRepository from "./testing-repository";

const testingRouter = Router({});

class TestingController {
  async deleteAll(_req: Request, res: Response) {
    await testingRepository.deleteAllData();

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }
}

testingRouter.delete("/all-data", new TestingController().deleteAll);

export default testingRouter;
