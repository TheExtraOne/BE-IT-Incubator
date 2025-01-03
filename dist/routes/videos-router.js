"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videosRouter = void 0;
const express_1 = require("express");
const settings_1 = require("../settings");
const db_1 = require("../db/db");
const field_validation_1 = require("../validation/field-validation");
exports.videosRouter = (0, express_1.Router)({});
const videoController = {
    getVideos: (_req, res) => {
        res.status(settings_1.STATUS.OK_200).json(db_1.db.videos);
    },
    getVideo: (req, res) => {
        const result = db_1.db.videos.find((video) => (video === null || video === void 0 ? void 0 : video.id) === +req.params.id);
        result
            ? res.status(settings_1.STATUS.OK_200).json(result)
            : res.sendStatus(settings_1.STATUS.NOT_FOUND_404);
    },
    createVideo: (req, res) => {
        const { title, author, availableResolutions = null } = req.body;
        const errors = {
            errorsMessages: [],
        };
        errors.errorsMessages.push(...field_validation_1.fieldValidator.validateTitle(title), ...field_validation_1.fieldValidator.validateAuthor(author), ...field_validation_1.fieldValidator.validateAvailableResolutions(availableResolutions));
        if (errors.errorsMessages.length) {
            res.status(settings_1.STATUS.BAD_REQUEST_400).json(errors);
            return;
        }
        const createdAt = new Date();
        const day = 60 * 60 * 24 * 1000;
        const newInputModel = {
            title,
            author,
            canBeDownloaded: false,
            minAgeRestriction: null,
            availableResolutions,
            id: Date.now() + Math.random(),
            createdAt: createdAt.toISOString(),
            publicationDate: new Date(createdAt.getTime() + day).toISOString(),
        };
        db_1.db.videos = [...db_1.db.videos, newInputModel];
        res.status(settings_1.STATUS.CREATED_201).json(newInputModel);
    },
    updateVideo: (req, res) => {
        const result = db_1.db.videos.find((video) => (video === null || video === void 0 ? void 0 : video.id) === +req.params.id);
        if (!result) {
            res.sendStatus(settings_1.STATUS.NOT_FOUND_404);
            return;
        }
        const { title: newTitle, author: newAuthor, canBeDownloaded: newCanBeDownloadedFlag, minAgeRestriction: newMinAgeRestriction, availableResolutions: newAvailableResolutions, publicationDate: newPublicationDate, } = req.body;
        const errors = {
            errorsMessages: [],
        };
        errors.errorsMessages.push(...field_validation_1.fieldValidator.validateTitle(newTitle), ...field_validation_1.fieldValidator.validateAuthor(newAuthor), ...field_validation_1.fieldValidator.validateCanBeDownloadedFlag(newCanBeDownloadedFlag), ...field_validation_1.fieldValidator.validateMinAgeRestriction(newMinAgeRestriction), ...field_validation_1.fieldValidator.validateAvailableResolutions(newAvailableResolutions), ...field_validation_1.fieldValidator.validatePublicationDate(newPublicationDate));
        if (errors.errorsMessages.length) {
            res.status(settings_1.STATUS.BAD_REQUEST_400).json(errors);
            return;
        }
        Object.assign(result, {
            title: newTitle,
            author: newAuthor,
            canBeDownloaded: newCanBeDownloadedFlag !== null && newCanBeDownloadedFlag !== void 0 ? newCanBeDownloadedFlag : result.canBeDownloaded,
            minAgeRestriction: typeof newMinAgeRestriction !== "undefined"
                ? newMinAgeRestriction
                : result.minAgeRestriction,
            availableResolutions: typeof newAvailableResolutions !== "undefined"
                ? newAvailableResolutions
                : result.availableResolutions,
            publicationDate: newPublicationDate !== null && newPublicationDate !== void 0 ? newPublicationDate : result.publicationDate,
        });
        res.sendStatus(settings_1.STATUS.NO_CONTENT_204);
    },
    deleteVideo: (req, res) => {
        const result = db_1.db.videos.filter((video) => (video === null || video === void 0 ? void 0 : video.id) !== +req.params.id);
        if (result.length === db_1.db.videos.length) {
            res.sendStatus(settings_1.STATUS.NOT_FOUND_404);
            return;
        }
        db_1.db.videos = result;
        res.sendStatus(settings_1.STATUS.NO_CONTENT_204);
    },
};
exports.videosRouter.get("/", videoController.getVideos);
exports.videosRouter.get("/:id", videoController.getVideo);
exports.videosRouter.post("/", videoController.createVideo);
exports.videosRouter.put("/:id", videoController.updateVideo);
exports.videosRouter.delete("/:id", videoController.deleteVideo);
