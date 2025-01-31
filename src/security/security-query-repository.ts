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
  getAllRefreshTokensMetaByUserId: async (
    userId: string
  ): Promise<TRefreshTokenMetaControllerViewModel[] | []> => {
    const refreshTokensMeta = await RefreshTokenModelClass.find()
      .where("userId", userId)
      .lean();

    return mapRefreshTokensMeta(refreshTokensMeta);
  },
};

export default securityQueryRepository;
