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
      lastActiveDate: securityService.convertTimeToISOFromUnix(
        resultDecode.data?.iat!
      ),
      expirationDate: securityService.convertTimeToISOFromUnix(
        resultDecode.data?.exp!
      ),
      deviceId,
      userId: resultDecode.data?.userId!,
    };

    await securityRepository.createRefreshTokenMeta(newRefreshTokenMeta);
  },

  getRefreshTokenMetaByFilters: async (
    filter: Record<string, string> | Record<string, never> = {}
  ): Promise<TRefreshTokensMetaRepViewModel | null> =>
    securityRepository.getRefreshTokenMetaByFilters(filter),

  deleteRefreshTokenMetaByDeviceId: (deviceId: string): Promise<boolean> =>
    securityRepository.deleteRefreshTokenMetaByDeviceId(deviceId),

  deleteAllRefreshTokensMeta: async ({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }): Promise<void> => {
    await securityRepository.deleteAllRefreshTokensMeta({ userId, deviceId });
  },

  updateRefreshTokenMetaTime: async ({
    deviceId,
    lastActiveDate,
  }: {
    deviceId: string;
    lastActiveDate: string;
  }): Promise<void> => {
    securityRepository.updateRefreshTokenMetaTime({
      deviceId,
      lastActiveDate,
    });
  },

  convertTimeToISOFromUnix: (unixTime: number): string =>
    new Date(unixTime * 1000).toISOString(),
};

export default securityService;
