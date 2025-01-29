import { ObjectId } from "mongodb";
import { CommentModelClass } from "../db/db";
import TCommentRepViewModel from "./models/CommentRepViewModel";

const commentsRepository = {
  createComment: async (newComment: TCommentRepViewModel): Promise<string> => {
    const { _id: insertedId } = await CommentModelClass.create(newComment);

    return insertedId.toString();
  },

  updateCommentById: async ({
    id,
    content,
  }: {
    id: string;
    content: string;
  }): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { matchedCount } = await CommentModelClass.updateOne(
      { _id: new ObjectId(id) },
      { $set: { content } }
    );

    return !!matchedCount;
  },

  deleteCommentById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await CommentModelClass.deleteOne({
      _id: new ObjectId(id),
    });

    return !!deletedCount;
  },

  getCommentById: async (id: string): Promise<TCommentRepViewModel | null> => {
    if (!ObjectId.isValid(id)) return null;

    const comment: TCommentRepViewModel | null =
      await CommentModelClass.findOne({
        _id: new ObjectId(id),
      }).lean();

    return comment;
  },
};

export default commentsRepository;
