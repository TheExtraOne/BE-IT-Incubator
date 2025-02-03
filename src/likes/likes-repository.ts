import { HydratedDocument } from "mongoose";
import LikesRepViewModel from "./models/LikeRepViewModel";

class LikesRepository {
  async saveLike(like: HydratedDocument<LikesRepViewModel>): Promise<void> {
    await like.save();
  }
}

export default LikesRepository;
