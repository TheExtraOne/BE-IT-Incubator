"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testingRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db/db");
const settings_1 = require("../settings");
exports.testingRouter = (0, express_1.Router)({});
exports.testingRouter.delete("/all-data", (_req, res) => {
    db_1.db.videos = [];
    res.sendStatus(settings_1.STATUS.NO_CONTENT_204);
});
