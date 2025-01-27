import { Router } from "express";
import securityController from "./security-controller";

const securityRouter = Router({});

securityRouter.get("/", securityController.getDevices);

export default securityRouter;
