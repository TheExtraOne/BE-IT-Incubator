import { Router } from "express";
import SecurityController from "./security-controller";
import refreshTokenVerificationMiddleware from "../adapters/middleware/refresh-token-verification-middleware";

const securityRouter = Router({});

const securityController = new SecurityController();
securityRouter.get(
  "/devices",
  refreshTokenVerificationMiddleware,
  securityController.getRefreshTokensMeta.bind(securityController)
);

securityRouter.delete(
  "/devices/:deviceId",
  refreshTokenVerificationMiddleware,
  securityController.deleteRefreshTokenMetaByDeviceId.bind(securityController)
);
securityRouter.delete(
  "/devices/",
  refreshTokenVerificationMiddleware,
  securityController.deleteAllRefreshTokensMeta.bind(securityController)
);

export default securityRouter;
