"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDB = exports.db = void 0;
exports.db = {
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
const setDB = (dataset) => {
    if (!dataset) {
        exports.db.videos = [];
        return;
    }
    exports.db.videos = dataset.videos || exports.db.videos;
};
exports.setDB = setDB;
