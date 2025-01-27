// import { ObjectId } from "mongodb";
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

  //   deletePostById: async (id: string): Promise<boolean> => {
  //     if (!ObjectId.isValid(id)) return false;
  //     const { deletedCount } = await postCollection.deleteOne({
  //       _id: new ObjectId(id),
  //     });

  //     return !!deletedCount;
  //   },
};

export default securityRepository;
