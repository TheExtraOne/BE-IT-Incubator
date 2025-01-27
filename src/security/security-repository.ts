import { refreshTokensMetaCollection } from "../db/db";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";

const securityRepository = {
  createRefreshTokenMeta: async (
    newRefreshTokenMeta: TRefreshTokensMetaRepViewModel
  ): Promise<string> => {
    const { insertedId } = await refreshTokensMetaCollection.insertOne(
      newRefreshTokenMeta
    );

    return insertedId.toString();
  },

  getRefreshTokenMetaByFilters: async (
    filter: Record<string, string> | Record<string, never> = {}
  ): Promise<TRefreshTokensMetaRepViewModel | null> => {
    const refreshTokensMeta: TRefreshTokensMetaRepViewModel | null =
      await refreshTokensMetaCollection.findOne(filter);

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
  }): Promise<void> => {
    await refreshTokensMetaCollection.updateOne(
      { ["deviceId"]: deviceId },
      {
        $set: {
          ["lastActiveDate"]: lastActiveDate,
          ["expirationDate"]: expirationDate,
        },
      }
    );
  },

  deleteRefreshTokenMetaByDeviceId: async (
    deviceId: string
  ): Promise<boolean> => {
    const { deletedCount } = await refreshTokensMetaCollection.deleteOne({
      ["deviceId"]: deviceId,
    });

    return !!deletedCount;
  },

  deleteAllRefreshTokensMeta: async ({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }): Promise<void> => {
    await refreshTokensMetaCollection.deleteMany({
      ["userId"]: userId,
      ["deviceId"]: { $ne: deviceId },
    });
  },
};

export default securityRepository;
