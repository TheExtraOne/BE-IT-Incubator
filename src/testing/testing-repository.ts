import {
  blogCollection,
  postCollection,
  userCollection,
  commentCollection,
  refreshTokensMetaCollection,
} from "../db/db";

const testingRepository = {
  deleteAllData: async (): Promise<void> => {
    await blogCollection.deleteMany({});
    await postCollection.deleteMany({});
    await userCollection.deleteMany({});
    await commentCollection.deleteMany({});
    await refreshTokensMetaCollection.deleteMany({});
  },
};

export default testingRepository;
