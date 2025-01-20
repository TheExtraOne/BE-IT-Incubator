import jwt from "jsonwebtoken";
import TUserRepViewModel from "../users/models/UserRepViewModel";
import { SETTINGS } from "../common/settings";

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

  getUserIdByToken: async (token: string): Promise<string | null> => {
    try {
      const result: jwt.JwtPayload | string = jwt.verify(
        token,
        SETTINGS.JWT_SECRET
      );
      if (typeof result === "string") return null;

      return result.userId;
    } catch (error) {
      return null;
    }
  },
};

export default jwtService;
