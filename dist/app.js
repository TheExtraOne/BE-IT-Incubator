"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const settings_1 = require("./settings");
const videos_router_1 = require("./routes/videos-router");
const testing_router_1 = require("./routes/testing-router");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.get("/", (_req, res) => {
    res.status(settings_1.STATUS.OK_200).json({ version: "1.0" });
});
exports.app.use(settings_1.SETTINGS.PATH.VIDEOS, videos_router_1.videosRouter);
exports.app.use(settings_1.SETTINGS.PATH.TESTING, testing_router_1.testingRouter);
