import jwt from "jsonwebtoken";
import { RESULT_STATUS, SETTINGS } from "../common/settings";
import { Result } from "../common/types/types";
import TUserControllerViewModel from "../users/models/UserControllerViewModel";

export type TCreateJWTResponse = {
  resultCode: number;
  data: {
    token: string;
  };
};

const jwtService = {
  createJWT: async (user: TUserControllerViewModel): Promise<string> => {
    const token: string = jwt.sign({ userId: user.id }, SETTINGS.JWT_SECRET, {
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
