import jwt from "jsonwebtoken";
import TUserRepViewModel from "../users/models/UserRepViewModel";
import { RESULT_STATUS, SETTINGS } from "../common/settings";
import { Result } from "../common/types/types";

export type TCreateJWTResponse = {
  resultCode: number;
  data: {
    token: string;
  };
};

const jwtService = {
  createJWT: async (user: TUserRepViewModel): Promise<string> => {
    const token: string = jwt.sign({ userId: user._id }, SETTINGS.JWT_SECRET, {
      expiresIn: "1h",
    });

    return token;
  },

  getUserIdByToken: async (token: string): Promise<Result<string | null>> => {
    try {
      const result: jwt.JwtPayload | string = jwt.verify(
        token,
        SETTINGS.JWT_SECRET
      );
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
      return {
        status: RESULT_STATUS.UNAUTHORIZED,
        data: null,
        errorMessage: "Unauthorized",
        extensions: [{ field: "token", message: "Incorrect token" }],
      };
    }
  },
};

export default jwtService;
