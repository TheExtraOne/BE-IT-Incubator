import { ObjectId } from "mongodb";
import { HydratedDocument } from "mongoose";
import { CommentModelDb } from "../domain/comment-model";
import CommentRepViewModel from "../types/CommentRepViewModel";

class CommentsRepository {
  async saveComment(
    comment: HydratedDocument<CommentRepViewModel>
  ): Promise<void> {
    await comment.save();
  }

  async deleteComment(
    comment: HydratedDocument<CommentRepViewModel>
  ): Promise<void> {
    await comment.deleteOne();
  }

  async getCommentById(
    id: string
  ): Promise<HydratedDocument<CommentRepViewModel> | null> {
    if (!ObjectId.isValid(id)) return null;
    const comment: HydratedDocument<CommentRepViewModel> | null =
      await CommentModelDb.findById(new ObjectId(id));

    return comment;
  }
}

export default CommentsRepository;
