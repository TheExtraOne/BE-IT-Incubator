import { RefreshTokenModelDb } from "../../db/db";
import TRefreshTokenMetaControllerViewModel from "../domain/RefreshTokenMetaControllerViewModel";
import RefreshTokensMetaRepViewModel from "../domain/RefreshTokensMetaRepViewModel";

class SecurityQueryRepository {
  private mapRefreshTokenMeta(
    refreshTokenMeta: RefreshTokensMetaRepViewModel
  ): TRefreshTokenMetaControllerViewModel {
    return {
      ip: refreshTokenMeta.ip,
      title: refreshTokenMeta.title,
      lastActiveDate: refreshTokenMeta.lastActiveDate,
      deviceId: refreshTokenMeta._id.toString(),
    };
  }

  private mapRefreshTokensMeta(
    refreshTokensMeta: RefreshTokensMetaRepViewModel[] | []
  ): TRefreshTokenMetaControllerViewModel[] | [] {
    return refreshTokensMeta.map(this.mapRefreshTokenMeta);
  }

  async getAllRefreshTokensMetaByUserId(
    userId: string
  ): Promise<TRefreshTokenMetaControllerViewModel[] | []> {
    const refreshTokensMeta = await RefreshTokenModelDb.find()
      .where("userId", userId)
      .lean();

    return this.mapRefreshTokensMeta(refreshTokensMeta);
  }
}

export default SecurityQueryRepository;
