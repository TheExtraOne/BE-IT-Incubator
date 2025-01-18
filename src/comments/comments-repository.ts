import { ObjectId } from "mongodb";
import { commentCollection } from "../db/db";
import TCommentRepViewModel from "./models/CommentRepViewModel";

const commentsRepository = {
  createComment: async (newComment: TCommentRepViewModel): Promise<string> => {
    const { insertedId } = await commentCollection.insertOne(newComment);

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
    const { matchedCount } = await commentCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { content } }
    );

    return !!matchedCount;
  },

  deleteCommentById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await commentCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return !!deletedCount;
  },
};

export default commentsRepository;
