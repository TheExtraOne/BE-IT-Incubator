import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";
import RefreshTokensMetaRepViewModel from "../types/RefreshTokensMetaRepViewModel";
import { RefreshTokenModelDb } from "../domain/refresh-token-model";

class SecurityRepository {
  async saveRefreshTokenMeta(
    refreshTokenMeta: HydratedDocument<RefreshTokensMetaRepViewModel>
  ): Promise<void> {
    await refreshTokenMeta.save();
  }

  async getRefreshTokensMetaByDeviceId(
    deviceId: string
  ): Promise<HydratedDocument<RefreshTokensMetaRepViewModel> | null> {
    if (!ObjectId.isValid(deviceId)) return null;

    const refreshTokenMetaInstance: HydratedDocument<RefreshTokensMetaRepViewModel> | null =
      await RefreshTokenModelDb.findById(new ObjectId(deviceId));

    return refreshTokenMetaInstance;
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
    if (!ObjectId.isValid(deviceId)) return null;

    const query = RefreshTokenModelDb.findById(new ObjectId(deviceId));
    if (userId) query.where("userId", userId);
    if (lastActiveDate) query.where("lastActiveDate", lastActiveDate);
    const refreshTokensMeta: RefreshTokensMetaRepViewModel | null =
      await query.lean();

    return refreshTokensMeta;
  }

  async deleteRefreshTokenMeta(
    refreshTokenMeta: HydratedDocument<RefreshTokensMetaRepViewModel>
  ): Promise<void> {
    await refreshTokenMeta.deleteOne();
  }

  async deleteAllRefreshTokensMeta({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }): Promise<boolean> {
    if (!ObjectId.isValid(deviceId)) return false;

    const { deletedCount } = await RefreshTokenModelDb.deleteMany({
      ["userId"]: userId,
      _id: { $ne: new ObjectId(deviceId) },
    });

    return !!deletedCount;
  }
}

export default SecurityRepository;
