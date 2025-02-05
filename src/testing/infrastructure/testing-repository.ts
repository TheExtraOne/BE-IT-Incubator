import { BlogModelDb } from "../../blogs/domain/blog-model";
import { CommentModelDb } from "../../comments/domain/comment-model";
import { LikeModelDb } from "../../likes/domain/like-model";
import { PostModelDb } from "../../posts/domain/post-model";
import { RateLimitModelDb } from "../../rate-limiting/domain/rate-limit-model";
import { RefreshTokenModelDb } from "../../security/domain/refresh-token-model";
import { UserModelDb } from "../../users/domain/user-model";

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
