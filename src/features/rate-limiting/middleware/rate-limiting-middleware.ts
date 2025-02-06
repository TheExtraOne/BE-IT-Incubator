import { Request, Response, NextFunction } from "express";
import RateLimitingService from "../app/rate-limiting-service";
import { SETTINGS, HTTP_STATUS } from "../../../common/settings";
import { container } from "../../../composition-root";

const rateLimitingService = container.get<RateLimitingService>(
  "RateLimitingService"
);
const rateLimitingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await rateLimitingService.createNewRequest({
    ip: req.ip || "::1",
    url: req.originalUrl,
  });

  const requestNumber: number = await rateLimitingService.getRequestsCount({
    ip: req.ip || "::1",
    url: req.originalUrl,
  });

  if (requestNumber > +SETTINGS.RATE_LIMIT_MAX_REQUESTS) {
    res.sendStatus(HTTP_STATUS.TOO_MANY_REQUESTS_429);
    return;
  }

  next();
};

export default rateLimitingMiddleware;
