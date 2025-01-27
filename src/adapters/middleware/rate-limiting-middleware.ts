import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../common/settings";
import rateLimitingService from "../rate-limitimg-service";

const rateLimitingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await rateLimitingService.createNewRequest({
    ip: req.ip || "::1",
    url: req.baseUrl,
  });

  const requestNumber = await rateLimitingService.getRequests({
    ip: req.ip || "::1",
    url: req.baseUrl,
  });

  if (requestNumber > 5) {
    res.sendStatus(HTTP_STATUS.TOO_MANY_REQUESTS_429);
    return;
  }

  next();
};

export default rateLimitingMiddleware;
