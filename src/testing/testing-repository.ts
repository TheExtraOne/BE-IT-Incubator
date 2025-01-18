import {
  blogCollection,
  postCollection,
  userCollection,
  commentCollection,
} from "../db/db";

const testingRepository = {
  deleteAllData: async (): Promise<void> => {
    await blogCollection.deleteMany({});
    await postCollection.deleteMany({});
    await userCollection.deleteMany({});
    await commentCollection.deleteMany({});
  },
};

export default testingRepository;
