import { refreshTokensMetaCollection } from "../db/db";
import TRefreshTokensMetaRepViewModel from "./models/RefreshTokensMetaRepViewModel";

const securityQueryRepository = {
  getAllRefreshTokensMeta: async (): Promise<
    TRefreshTokensMetaRepViewModel[] | []
  > => {
    const refreshTokensMeta: TRefreshTokensMetaRepViewModel[] | [] =
      await refreshTokensMetaCollection.find({}).toArray();

    return refreshTokensMeta;
  },
};

export default securityQueryRepository;
