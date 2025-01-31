import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, SETTINGS } from "../../common/settings";
import rateLimitingService from "../rate-limiting-service";

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
