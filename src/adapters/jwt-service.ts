import jwt from "jsonwebtoken";
import { RESULT_STATUS, SETTINGS, TOKEN_TYPE } from "../common/settings";
import { Result } from "../common/types/types";

export type TCreateJWTResponse = {
  resultCode: number;
  data: {
    token: string;
  };
};

class JwtService {
  async createToken({
    payload,
    type,
  }: {
    payload: Record<string, string | number>;
    type?: TOKEN_TYPE;
  }): Promise<string> {
    let token: string;

    switch (type) {
      case TOKEN_TYPE.AC_TOKEN:
        token = jwt.sign(payload, SETTINGS.AC_SECRET, {
          expiresIn: SETTINGS.AC_EXPIRY,
        });
        break;
      case TOKEN_TYPE.R_TOKEN:
        token = jwt.sign(payload, SETTINGS.RT_SECRET, {
          expiresIn: SETTINGS.RT_EXPIRY,
        });
        break;
      default:
        token = jwt.sign(payload, SETTINGS.JWT_SECRET, {
          expiresIn: SETTINGS.JWT_EXPIRY,
        });
        break;
    }

    return token;
  }

  async verifyToken({
    token,
    type,
  }: {
    token: string;
    type?: TOKEN_TYPE;
  }): Promise<Result<string | null>> {
    try {
      let secret = SETTINGS.JWT_SECRET;
      if (type)
        secret =
          type === TOKEN_TYPE.AC_TOKEN
            ? SETTINGS.AC_SECRET
            : SETTINGS.RT_SECRET;

      const result: jwt.JwtPayload | string = jwt.verify(token, secret);

      if (typeof result === "string") {
        return {
          status: RESULT_STATUS.UNAUTHORIZED,
          data: null,
          errorMessage: "Unauthorized",
          extensions: [{ field: "token", message: "Incorrect token" }],
        };
      }

      return {
        status: RESULT_STATUS.SUCCESS,
        data: result.userId,
        extensions: [],
      };
    } catch (error) {
      console.log("error", error);
      return {
        status: RESULT_STATUS.UNAUTHORIZED,
        data: null,
        errorMessage: "Unauthorized",
        extensions: [{ field: "token", message: `${error}` }],
      };
    }
  }

  async decodeToken(token: string): Promise<
    Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null>
  > {
    try {
      const result = jwt.decode(token);
      if (typeof result === "string") {
        return {
          status: RESULT_STATUS.UNAUTHORIZED,
          data: null,
          errorMessage: "Unauthorized",
          extensions: [{ field: "token", message: "Incorrect token" }],
        };
      }
      return {
        status: RESULT_STATUS.SUCCESS,
        data: {
          iat: result?.iat,
          exp: result?.exp,
          userId: result?.userId,
          deviceId: result?.deviceId,
        },
        extensions: [],
      };
    } catch (error) {
      console.error("Can't decode token", error);
      return {
        status: RESULT_STATUS.UNAUTHORIZED,
        data: null,
        errorMessage: "Unauthorized",
        extensions: [{ field: "token", message: `${error}` }],
      };
    }
  }
}

export default JwtService;
