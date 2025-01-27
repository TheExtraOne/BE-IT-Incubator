import { v4 as uuidv4 } from "uuid";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";
import { ObjectId } from "mongodb";
import securityRepository from "./security-repository";
import jwtService from "../adapters/jwt-service";
import { Result } from "../common/types/types";

const securityService = {
  createRefreshTokenMeta: async ({
    refreshToken,
    title,
    ip,
  }: {
    refreshToken: string;
    title: string;
    ip: string;
  }): Promise<void> => {
    const resultDecode: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
    } | null> = await jwtService.decodeToken(refreshToken);

    const newRefreshTokenMeta: TRefreshTokensMetaRepViewModel = {
      _id: new ObjectId(),
      ip,
      title,
      lastActiveDate: securityService._convertTimeToISOFromUnix(
        resultDecode.data?.iat!
      ),
      expirationDate: securityService._convertTimeToISOFromUnix(
        resultDecode.data?.exp!
      ),
      deviceId: uuidv4(),
      userId: resultDecode.data?.userId!,
    };

    securityRepository.createRefreshTokenMeta(newRefreshTokenMeta);
  },

  _convertTimeToISOFromUnix: (unixTime: number): string =>
    new Date(unixTime * 1000).toISOString(),
};

export default securityService;
