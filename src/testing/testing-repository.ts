import {
  BlogModel,
  PostModel,
  UserModel,
  CommentModel,
  RefreshTokenModel,
  RateLimitModel,
} from "../db/db";

const testingRepository = {
  deleteAllData: async (): Promise<void> => {
    await BlogModel.deleteMany({});
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    await CommentModel.deleteMany({});
    await RefreshTokenModel.deleteMany({});
    await RateLimitModel.deleteMany({});
  },
};

export default testingRepository;
