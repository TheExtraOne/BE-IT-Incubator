import RefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";
import { ObjectId } from "mongodb";
import securityRepository from "./security-repository";
import jwtService from "../adapters/jwt-service";
import { Result } from "../common/types/types";
import { RefreshTokenModelDb } from "../db/db";
import { RESULT_STATUS } from "../common/settings";
import { HydratedDocument } from "mongoose";

class SecurityService {
  async createRefreshTokenMeta({
    refreshToken,
    title,
    ip,
    deviceId,
  }: {
    refreshToken: string;
    title: string;
    ip: string;
    deviceId?: ObjectId;
  }): Promise<void> {
    const resultDecode: Result<{
      iat?: number;
      exp?: number;
      userId?: string;
      deviceId?: string;
    } | null> = await jwtService.decodeToken(refreshToken);

    const newRefreshTokenMeta: RefreshTokensMetaRepViewModel = {
      _id: deviceId ?? new ObjectId(),
      ip,
      title,
      lastActiveDate: this.convertTimeToISOFromUnix(resultDecode.data?.iat!),
      expirationDate: this.convertTimeToISOFromUnix(resultDecode.data?.exp!),
      userId: resultDecode.data?.userId!,
    };
    const refreshTokenMetaInstance = new RefreshTokenModelDb(
      newRefreshTokenMeta
    );
    await securityRepository.saveRefreshTokenMeta(refreshTokenMetaInstance);
  }

  async getRefreshTokenMetaByFilters({
    deviceId,
    userId,
    lastActiveDate,
  }: {
    deviceId: string;
    userId?: string;
    lastActiveDate?: string;
  }): Promise<RefreshTokensMetaRepViewModel | null> {
    // No mapping
    return await securityRepository.getRefreshTokenMetaByFilters({
      deviceId,
      userId,
      lastActiveDate,
    });
  }

  async deleteRefreshTokenMetaByDeviceId(deviceId: string): Promise<Result> {
    const refreshTokenMetaInstance: HydratedDocument<RefreshTokensMetaRepViewModel> | null =
      await securityRepository.getRefreshTokensMetaByDeviceId(deviceId);
    if (!refreshTokenMetaInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "deviceId", message: "Not found" }],
      };
    }

    await securityRepository.deleteRefreshTokenMeta(refreshTokenMetaInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  async deleteAllRefreshTokensMeta({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }): Promise<void> {
    await securityRepository.deleteAllRefreshTokensMeta({
      userId,
      deviceId,
    });
  }

  async updateRefreshTokenMetaTime({
    deviceId,
    lastActiveDate,
    expirationDate,
  }: {
    deviceId: string;
    lastActiveDate: string;
    expirationDate: string;
  }): Promise<Result> {
    const refreshTokenMetaInstance: HydratedDocument<RefreshTokensMetaRepViewModel> | null =
      await securityRepository.getRefreshTokensMetaByDeviceId(deviceId);

    if (!refreshTokenMetaInstance) {
      return {
        status: RESULT_STATUS.NOT_FOUND,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "deviceId", message: "Not found" }],
      };
    }

    refreshTokenMetaInstance.lastActiveDate = lastActiveDate;
    refreshTokenMetaInstance.expirationDate = expirationDate;

    await securityRepository.saveRefreshTokenMeta(refreshTokenMetaInstance);

    return {
      status: RESULT_STATUS.SUCCESS,
      data: null,
      extensions: [],
    };
  }

  convertTimeToISOFromUnix(unixTime: number): string {
    return new Date(unixTime * 1000).toISOString();
  }
}

export default new SecurityService();
