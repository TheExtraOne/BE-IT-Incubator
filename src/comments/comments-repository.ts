import { ObjectId } from "mongodb";
import { CommentModelClass } from "../db/db";
import TCommentRepViewModel from "./models/CommentRepViewModel";
import { HydratedDocument } from "mongoose";

const commentsRepository = {
  saveComment: async (
    comment: HydratedDocument<TCommentRepViewModel>
  ): Promise<void> => {
    await comment.save();
  },

  deleteCommentById: async (
    comment: HydratedDocument<TCommentRepViewModel>
  ): Promise<void> => {
    await comment.deleteOne();
  },

  getCommentById: async (
    id: string
  ): Promise<HydratedDocument<TCommentRepViewModel> | null> => {
    if (!ObjectId.isValid(id)) return null;
    const comment: HydratedDocument<TCommentRepViewModel> | null =
      await CommentModelClass.findById(new ObjectId(id));

    return comment;
  },
};

export default commentsRepository;
