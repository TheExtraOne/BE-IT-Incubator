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
    deviceId,
  }: {
    refreshToken: string;
    title: string;
    ip: string;
    deviceId: string;
  }): Promise<void> => {
    const resultDecode: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
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
      deviceId,
      userId: resultDecode.data?.userId!,
    };

    securityRepository.createRefreshTokenMeta(newRefreshTokenMeta);
  },

  getRefreshTokenMetaByFilters: async ({
    filter = {},
  }: {
    filter?: Record<string, string> | Record<string, never>;
  }): Promise<TRefreshTokensMetaRepViewModel | null> =>
    securityRepository.getRefreshTokenMetaByFilters({ filter }),

  deleteRefreshTokenMetaByDeviceId: (deviceId: string): Promise<boolean> =>
    securityRepository.deleteRefreshTokenMetaByDeviceId(deviceId),

  _convertTimeToISOFromUnix: (unixTime: number): string =>
    new Date(unixTime * 1000).toISOString(),
};

export default securityService;
