"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldValidator = void 0;
const settings_1 = require("../settings");
exports.fieldValidator = {
    validateTitle: (title) => {
        const errorsMessages = [];
        if (!title)
            errorsMessages.push({
                message: "Title is a required field",
                field: "title",
            });
        return errorsMessages;
    },
    validateAuthor: (author) => {
        const errorsMessages = [];
        if (!author)
            errorsMessages.push({
                message: "Author is a required field",
                field: "author",
            });
        return errorsMessages;
    },
    validateAvailableResolutions: (availableResolutions) => {
        const errorsMessages = [];
        console.log("availableResolutions", typeof availableResolutions);
        console.log("!Array.isArray(availableResolutions)", !Array.isArray(availableResolutions));
        if (!Array.isArray(availableResolutions) && availableResolutions !== null) {
            errorsMessages.push({
                message: "Incorrect type",
                field: "availableResolutions",
            });
        }
        if (Array.isArray(availableResolutions) &&
            availableResolutions.find((resolution) => !settings_1.RESOLUTIONS.includes(resolution))) {
            errorsMessages.push({
                message: "There is no such resolution",
                field: "availableResolutions",
            });
        }
        return errorsMessages;
    },
};
