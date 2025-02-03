import {
  BlogModelDb,
  PostModelDb,
  UserModelDb,
  CommentModelDb,
  RefreshTokenModelDb,
  RateLimitModelDb,
  LikeModelDb,
} from "../db/db";

class TestingRepository {
  async deleteAllData(): Promise<void> {
    await BlogModelDb.deleteMany({});
    await PostModelDb.deleteMany({});
    await UserModelDb.deleteMany({});
    await CommentModelDb.deleteMany({});
    await RefreshTokenModelDb.deleteMany({});
    await RateLimitModelDb.deleteMany({});
    await LikeModelDb.deleteMany({});
  }
}

export default new TestingRepository();
