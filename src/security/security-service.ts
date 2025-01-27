import { v4 as uuidv4 } from "uuid";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";
import { ObjectId } from "mongodb";
import securityRepository from "./security-repository";
import jwtService from "../adapters/jwt-service";
import { Result } from "../common/types/types";

const securityService = {
  createRefreshTokenMeta: async (refreshToken: string): Promise<void> => {
    const resultDecode: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
    } | null> = await jwtService.decodeToken(refreshToken);

    const newRefreshTokenMeta: TRefreshTokensMetaRepViewModel = {
      _id: new ObjectId(),
      ip: "some ip",
      title: "some title",
      lastActiveDate: new Date(resultDecode.data?.iat! * 1000).toISOString(),
      deviceId: uuidv4(),
      userId: resultDecode.data?.userId!,
    };

    securityRepository.createRefreshTokenMeta(newRefreshTokenMeta);
  },
};

export default securityService;
