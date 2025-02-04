import { Router } from "express";
import refreshTokenVerificationMiddleware from "../../adapters/middleware/refresh-token-verification-middleware";
import { securityController } from "../../composition-root";

const securityRouter = Router({});

securityRouter
  .route("/devices")
  .get(
    refreshTokenVerificationMiddleware,
    securityController.getRefreshTokensMeta.bind(securityController)
  )
  .delete(
    refreshTokenVerificationMiddleware,
    securityController.deleteAllRefreshTokensMeta.bind(securityController)
  );

securityRouter.delete(
  "/devices/:deviceId",
  refreshTokenVerificationMiddleware,
  securityController.deleteRefreshTokenMetaByDeviceId.bind(securityController)
);

export default securityRouter;
