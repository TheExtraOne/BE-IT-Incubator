import {
  BlogModelClass,
  PostModelClass,
  UserModelClass,
  CommentModelClass,
  RefreshTokenModelClass,
  RateLimitModelClass,
} from "../db/db";

const testingRepository = {
  deleteAllData: async (): Promise<void> => {
    await BlogModelClass.deleteMany({});
    await PostModelClass.deleteMany({});
    await UserModelClass.deleteMany({});
    await CommentModelClass.deleteMany({});
    await RefreshTokenModelClass.deleteMany({});
    await RateLimitModelClass.deleteMany({});
  },
};

export default testingRepository;
