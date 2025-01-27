import { refreshTokensMetaCollection } from "../db/db";
import TRefreshTokenMetaControllerViewModel from "./models/RefreshTokenMetaControllerViewModel";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";

const mapRefreshTokenMeta = (
  refreshTokenMeta: TRefreshTokensMetaRepViewModel
): TRefreshTokenMetaControllerViewModel => ({
  ip: refreshTokenMeta.ip,
  title: refreshTokenMeta.title,
  lastActiveDate: refreshTokenMeta.lastActiveDate,
  deviceId: refreshTokenMeta.deviceId,
});

const mapRefreshTokensMeta = (
  refreshTokensMeta: TRefreshTokensMetaRepViewModel[] | []
): TRefreshTokenMetaControllerViewModel[] | [] =>
  refreshTokensMeta.map(mapRefreshTokenMeta);

const securityQueryRepository = {
  getAllRefreshTokensMeta: async (): Promise<
    TRefreshTokenMetaControllerViewModel[] | []
  > => {
    const refreshTokensMeta: TRefreshTokensMetaRepViewModel[] | [] =
      await refreshTokensMetaCollection.find({}).toArray();

    return mapRefreshTokensMeta(refreshTokensMeta);
  },
};

export default securityQueryRepository;
