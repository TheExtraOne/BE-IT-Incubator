import { TVideoViewModel } from "../models/VideoViewModel";

export type TDB = {
  videos: TVideoViewModel[];
};

export const db: TDB = {
  // videos: [
  //   {
  //     id: 0,
  //     title: "Shape of my heart",
  //     author: "Sting",
  //     canBeDownloaded: true,
  //     minAgeRestriction: null,
  //     createdAt: "2024-12-31T07:32:45.862Z",
  //     publicationDate: "2024-12-31T07:32:45.862Z",
  //     availableResolutions: ["P144"],
  //   },
  // ],
  videos: [],
};

export const setDB = (dataset?: TDB) => {
  if (!dataset) {
    db.videos = [];
    return;
  }

  db.videos = dataset.videos || db.videos;
};
