import { Router } from "express";
import refreshTokenVerificationMiddleware from "../../adapters/middleware/refresh-token-verification-middleware";
import { securityController } from "../../composition-root";

const securityRouter = Router({});

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
