import { ObjectId } from "mongodb";
import { RefreshTokenModelClass } from "../db/db";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";
import { HydratedDocument } from "mongoose";

const securityRepository = {
  saveRefreshTokenMeta: async (
    refreshTokenMeta: HydratedDocument<TRefreshTokensMetaRepViewModel>
  ): Promise<void> => {
    await refreshTokenMeta.save();
  },

  getRefreshTokensMetaByDeviceId: async (
    deviceId: string
  ): Promise<HydratedDocument<TRefreshTokensMetaRepViewModel> | null> => {
    if (!ObjectId.isValid(deviceId)) return null;

    const refreshTokenMetaInstance: HydratedDocument<TRefreshTokensMetaRepViewModel> | null =
      await RefreshTokenModelClass.findById(new ObjectId(deviceId));

    return refreshTokenMetaInstance;
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
    if (!ObjectId.isValid(deviceId)) return null;

    const query = RefreshTokenModelClass.findById(new ObjectId(deviceId));
    if (userId) query.where("userId", userId);
    if (lastActiveDate) query.where("lastActiveDate", lastActiveDate);
    const refreshTokensMeta: TRefreshTokensMetaRepViewModel | null =
      await query.lean();

    return refreshTokensMeta;
  },

  deleteRefreshTokenMeta: async (
    refreshTokenMeta: HydratedDocument<TRefreshTokensMetaRepViewModel>
  ): Promise<void> => {
    await refreshTokenMeta.deleteOne();
  },

  deleteAllRefreshTokensMeta: async ({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }): Promise<boolean> => {
    if (!ObjectId.isValid(deviceId)) return false;

    const { deletedCount } = await RefreshTokenModelClass.deleteMany({
      ["userId"]: userId,
      _id: { $ne: new ObjectId(deviceId) },
    });

    return !!deletedCount;
  },
};

export default securityRepository;
