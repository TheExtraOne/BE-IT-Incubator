import { Router } from "express";
import securityController from "./security-controller";
import refreshTokenVerificationMiddleware from "../adapters/middleware/refresh-token-verification-middleware";

const securityRouter = Router({});

securityRouter.get(
  "/devices",
  refreshTokenVerificationMiddleware,
  securityController.getDevices
);

export default securityRouter;
