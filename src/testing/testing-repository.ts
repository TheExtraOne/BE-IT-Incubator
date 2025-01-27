import {
  blogCollection,
  postCollection,
  userCollection,
  commentCollection,
  refreshTokensMetaCollection,
  rateLimitingCollection,
} from "../db/db";

const testingRepository = {
  deleteAllData: async (): Promise<void> => {
    await blogCollection.deleteMany({});
    await postCollection.deleteMany({});
    await userCollection.deleteMany({});
    await commentCollection.deleteMany({});
    await refreshTokensMetaCollection.deleteMany({});
    await rateLimitingCollection.deleteMany({});
  },
};

export default testingRepository;
