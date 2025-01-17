import { blogCollection, postCollection, userCollection } from "../db/db";

const testingRepository = {
  deleteAllData: async (): Promise<void> => {
    await blogCollection.deleteMany({});
    await postCollection.deleteMany({});
    await userCollection.deleteMany({});
  },
};

export default testingRepository;
