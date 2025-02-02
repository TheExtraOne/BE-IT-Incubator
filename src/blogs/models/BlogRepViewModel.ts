import { ObjectId } from "mongodb";

class BlogRepViewModel {
  constructor(
    public _id: ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean
  ) {}
}

export default BlogRepViewModel;
