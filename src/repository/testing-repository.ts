import db from "../db/db";

const testingRepository = {
  deleteAllData: () => {
    db.posts = [];
    db.blogs = [];
  },
};

export default testingRepository;
