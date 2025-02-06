import { BlogModelDb } from "../../features/blogs/domain/blog-model";
import { CommentModelDb } from "../../features/comments/domain/comment-model";
import { LikeModelDb } from "../../features/likes/domain/like-model";
import { PostModelDb } from "../../features/posts/domain/post-model";
import { RateLimitModelDb } from "../../features/rate-limiting/domain/rate-limit-model";
import { RefreshTokenModelDb } from "../../features/security/domain/refresh-token-model";
import { UserModelDb } from "../../features/users/domain/user-model";

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
