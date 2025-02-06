import { Router } from "express";
import refreshTokenVerificationMiddleware from "../../adapters/middleware/refresh-token-verification-middleware";
import { container } from "../../composition-root";
import SecurityController from "./security-controller";

const securityRouter = Router({});
const securityController =
  container.get<SecurityController>("SecurityController");

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
