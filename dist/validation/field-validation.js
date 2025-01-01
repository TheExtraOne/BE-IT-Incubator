"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldValidator = void 0;
const settings_1 = require("../settings");
const ERROR_MESSAGES = {
    INCORRECT_TYPE: "Incorrect type",
};
const ERROR_FIELDS = {
    TITLE: "title",
    AUTHOR: "author",
    AVAILABLE_RESOLUTIONS: "availableResolutions",
    CAN_BE_DOWNLOADED: "canBeDownloaded",
    MIN_AGE_RESTRICTION: "minAgeRestriction",
    PUBLICATION_DATE: "publicationDate",
};
exports.fieldValidator = {
    validateTitle: (title) => {
        const errorsMessages = [];
        if (!title || (typeof title === "string" && !title.trim().length)) {
            errorsMessages.push({
                message: "Title is a required field",
                field: ERROR_FIELDS.TITLE,
            });
            return errorsMessages;
        }
        if (typeof title !== "string") {
            errorsMessages.push({
                message: ERROR_MESSAGES.INCORRECT_TYPE,
                field: ERROR_FIELDS.TITLE,
            });
            return errorsMessages;
        }
        if (title.trim().length > 40) {
            errorsMessages.push({
                message: "Max length should be <= 40",
                field: ERROR_FIELDS.TITLE,
            });
            return errorsMessages;
        }
        return errorsMessages;
    },
    validateAuthor: (author) => {
        const errorsMessages = [];
        if (!author || (typeof author === "string" && !author.trim().length)) {
            errorsMessages.push({
                message: "Author is a required field",
                field: ERROR_FIELDS.AUTHOR,
            });
            return errorsMessages;
        }
        if (typeof author !== "string") {
            errorsMessages.push({
                message: ERROR_MESSAGES.INCORRECT_TYPE,
                field: ERROR_FIELDS.AUTHOR,
            });
            return errorsMessages;
        }
        if (author.trim().length > 20) {
            errorsMessages.push({
                message: "Max length should be <= 20",
                field: ERROR_FIELDS.AUTHOR,
            });
            return errorsMessages;
        }
        return errorsMessages;
    },
    validateAvailableResolutions: (availableResolutions) => {
        const errorsMessages = [];
        const isArray = Array.isArray(availableResolutions);
        if (!isArray &&
            availableResolutions !== null &&
            typeof availableResolutions !== "undefined") {
            errorsMessages.push({
                message: ERROR_MESSAGES.INCORRECT_TYPE,
                field: ERROR_FIELDS.AVAILABLE_RESOLUTIONS,
            });
            return errorsMessages;
        }
        if (isArray &&
            availableResolutions.find((resolution) => !settings_1.RESOLUTIONS.includes(resolution))) {
            errorsMessages.push({
                message: `There is no such resolution. Available resolutions: ${settings_1.RESOLUTIONS.join(" ")}`,
                field: ERROR_FIELDS.AVAILABLE_RESOLUTIONS,
            });
            return errorsMessages;
        }
        return errorsMessages;
    },
    validateCanBeDownloadedFlag: (canBeDownloaded) => {
        const errorsMessages = [];
        if (!["boolean", "undefined"].includes(typeof canBeDownloaded)) {
            errorsMessages.push({
                message: ERROR_MESSAGES.INCORRECT_TYPE,
                field: ERROR_FIELDS.CAN_BE_DOWNLOADED,
            });
            return errorsMessages;
        }
        return errorsMessages;
    },
    validateMinAgeRestriction: (minAgeRestriction) => {
        const errorsMessages = [];
        if (!["number", "undefined"].includes(typeof minAgeRestriction) &&
            minAgeRestriction !== null) {
            errorsMessages.push({
                message: ERROR_MESSAGES.INCORRECT_TYPE,
                field: ERROR_FIELDS.MIN_AGE_RESTRICTION,
            });
            return errorsMessages;
        }
        if (typeof minAgeRestriction === "number" &&
            (minAgeRestriction > 18 || minAgeRestriction < 1)) {
            errorsMessages.push({
                message: "Incorrect range. Max = 18, min = 1",
                field: ERROR_FIELDS.MIN_AGE_RESTRICTION,
            });
            return errorsMessages;
        }
        return errorsMessages;
    },
    validatePublicationDate: (publicationDate) => {
        const errorsMessages = [];
        if (!["string", "undefined"].includes(typeof publicationDate)) {
            errorsMessages.push({
                message: ERROR_MESSAGES.INCORRECT_TYPE,
                field: ERROR_FIELDS.PUBLICATION_DATE,
            });
            return errorsMessages;
        }
        if (typeof publicationDate === "string" && !publicationDate.trim().length) {
            errorsMessages.push({
                message: "Can be empty string",
                field: ERROR_FIELDS.PUBLICATION_DATE,
            });
            return errorsMessages;
        }
        return errorsMessages;
    },
};
