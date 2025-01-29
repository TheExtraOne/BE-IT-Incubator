import { RefreshTokenModelClass } from "../db/db";
import TRefreshTokenMetaControllerViewModel from "./models/RefreshTokenMetaControllerViewModel";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";

const mapRefreshTokenMeta = (
  refreshTokenMeta: TRefreshTokensMetaRepViewModel
): TRefreshTokenMetaControllerViewModel => ({
  ip: refreshTokenMeta.ip,
  title: refreshTokenMeta.title,
  lastActiveDate: refreshTokenMeta.lastActiveDate,
  deviceId: refreshTokenMeta._id.toString(),
});

const mapRefreshTokensMeta = (
  refreshTokensMeta: TRefreshTokensMetaRepViewModel[] | []
): TRefreshTokenMetaControllerViewModel[] | [] =>
  refreshTokensMeta.map(mapRefreshTokenMeta);

const securityQueryRepository = {
  getAllRefreshTokensMeta: async (
    filter: Record<string, string> | undefined = {}
  ): Promise<TRefreshTokenMetaControllerViewModel[] | []> => {
    const refreshTokensMeta: TRefreshTokensMetaRepViewModel[] | [] =
      await RefreshTokenModelClass.find(filter).lean();

    return mapRefreshTokensMeta(refreshTokensMeta);
  },
};

export default securityQueryRepository;
