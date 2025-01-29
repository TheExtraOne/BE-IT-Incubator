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
    deviceId?: ObjectId;
  }): Promise<void> => {
    const resultDecode: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await jwtService.decodeToken(refreshToken);

    const newRefreshTokenMeta: TRefreshTokensMetaRepViewModel = {
      _id: deviceId ?? new ObjectId(),
      ip,
      title,
      lastActiveDate: securityService.convertTimeToISOFromUnix(
        resultDecode.data?.iat!
      ),
      expirationDate: securityService.convertTimeToISOFromUnix(
        resultDecode.data?.exp!
      ),
      userId: resultDecode.data?.userId!,
    };

    await securityRepository.createRefreshTokenMeta(newRefreshTokenMeta);
  },

  getRefreshTokenMetaByFilters: async ({
    deviceId,
    userId,
    lastActiveDate,
  }: {
    deviceId: string;
    userId?: string;
    lastActiveDate?: string;
  }): Promise<TRefreshTokensMetaRepViewModel | null> => {
    // No mapping
    return await securityRepository.getRefreshTokenMetaByFilters({
      deviceId,
      userId,
      lastActiveDate,
    });
  },

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
    expirationDate,
  }: {
    deviceId: string;
    lastActiveDate: string;
    expirationDate: string;
  }): Promise<void> => {
    securityRepository.updateRefreshTokenMetaTime({
      deviceId,
      lastActiveDate,
      expirationDate,
    });
  },

  convertTimeToISOFromUnix: (unixTime: number): string =>
    new Date(unixTime * 1000).toISOString(),
};

export default securityService;
