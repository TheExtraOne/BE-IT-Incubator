import { RESULT_STATUS, HTTP_STATUS } from "./settings";

export const resultCodeToHttpException = (
  resultCode: RESULT_STATUS
): number => {
  switch (resultCode) {
    case RESULT_STATUS.BAD_REQUEST:
      return HTTP_STATUS.BAD_REQUEST_400;
    case RESULT_STATUS.FORBIDDEN:
      return HTTP_STATUS.FORBIDDEN_403;
    case RESULT_STATUS.NOT_FOUND:
      return HTTP_STATUS.NOT_FOUND_404;
    case RESULT_STATUS.UNAUTHORIZED:
      return HTTP_STATUS.UNAUTHORIZED_401;
    default:
      return HTTP_STATUS.SERVER_ERROR_500;
  }
};
