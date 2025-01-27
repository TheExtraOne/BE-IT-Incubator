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

  getRefreshTokenMetaByFilters: async ({
    filter = {},
  }: {
    filter?: Record<string, string> | Record<string, never>;
  }): Promise<TRefreshTokensMetaRepViewModel | null> => {
    const refreshTokensMeta: TRefreshTokensMetaRepViewModel | null =
      await refreshTokensMetaCollection.findOne(filter);

    return refreshTokensMeta;
  },

  deleteRefreshTokenMetaByDeviceId: async (
    deviceId: string
  ): Promise<boolean> => {
    const { deletedCount } = await refreshTokensMetaCollection.deleteOne({
      deviceId,
    });

    return !!deletedCount;
  },
};

export default securityRepository;
