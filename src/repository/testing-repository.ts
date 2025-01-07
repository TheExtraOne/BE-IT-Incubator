import { blogCollection, postCollection } from "./db";

const testingRepository = {
  deleteAllData: async (): Promise<void> => {
    await blogCollection.deleteMany({});
    await postCollection.deleteMany({});
  },
};

export default testingRepository;
