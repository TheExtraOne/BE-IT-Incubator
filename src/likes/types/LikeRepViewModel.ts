import { ObjectId } from "mongodb";
import { LIKE_STATUS, LIKE_TYPE } from "../../common/settings";

class LikesRepViewModel {
  constructor(
    public _id: ObjectId,
    public status: LIKE_STATUS,
    public authorId: string,
    public parentId: string,
    public createdAt: Date,
    public likeType: LIKE_TYPE,
    public login: string
  ) {}
}

export default LikesRepViewModel;
