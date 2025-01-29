import { ObjectId } from "mongodb";
import { RefreshTokenModelClass } from "../db/db";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";

const securityRepository = {
  createRefreshTokenMeta: async (
    newRefreshTokenMeta: TRefreshTokensMetaRepViewModel
  ): Promise<string> => {
    const { _id: insertedId } = await RefreshTokenModelClass.create(
      newRefreshTokenMeta
    );

    return insertedId.toString();
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

    const filter: Record<string, string | ObjectId> = {
      _id: new ObjectId(deviceId),
    };
    if (userId) filter["userId"] = userId;
    if (lastActiveDate) filter["lastActiveDate"] = lastActiveDate;

    const refreshTokensMeta: TRefreshTokensMetaRepViewModel | null =
      await RefreshTokenModelClass.findOne(filter).lean();

    return refreshTokensMeta;
  },

  updateRefreshTokenMetaTime: async ({
    deviceId,
    lastActiveDate,
    expirationDate,
  }: {
    deviceId: string;
    lastActiveDate: string;
    expirationDate: string;
  }): Promise<boolean> => {
    if (!ObjectId.isValid(deviceId)) return false;
    const { matchedCount } = await RefreshTokenModelClass.updateOne(
      { _id: new ObjectId(deviceId) },
      {
        $set: {
          ["lastActiveDate"]: lastActiveDate,
          ["expirationDate"]: expirationDate,
        },
      }
    );

    return !!matchedCount;
  },

  deleteRefreshTokenMetaByDeviceId: async (
    deviceId: string
  ): Promise<boolean> => {
    if (!ObjectId.isValid(deviceId)) return false;
    const { deletedCount } = await RefreshTokenModelClass.deleteOne({
      _id: new ObjectId(deviceId),
    });

    return !!deletedCount;
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
