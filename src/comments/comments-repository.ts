import { ObjectId } from "mongodb";
import { commentCollection } from "../db/db";
import TCommentRepViewModel from "./models/CommentRepViewModel";

const commentsRepository = {
  createComment: async (newComment: TCommentRepViewModel): Promise<string> => {
    const { insertedId } = await commentCollection.insertOne(newComment);

    return insertedId.toString();
  },

  //   updatePostById: async ({
  //     id,
  //     title,
  //     shortDescription,
  //     content,
  //     blogId,
  //   }: {
  //     id: string;
  //     title: string;
  //     shortDescription: string;
  //     content: string;
  //     blogId: string;
  //   }): Promise<boolean> => {
  //     if (!ObjectId.isValid(id)) return false;
  //     const { matchedCount } = await postCollection.updateOne(
  //       { _id: new ObjectId(id) },
  //       { $set: { title, shortDescription, content, blogId } }
  //     );

  //     return !!matchedCount;
  //   },

  deleteCommentById: async (id: string): Promise<boolean> => {
    if (!ObjectId.isValid(id)) return false;
    const { deletedCount } = await commentCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return !!deletedCount;
  },
};

export default commentsRepository;
