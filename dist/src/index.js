"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_CODES = exports.app = void 0;
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const port = 3000;
const jsonBodyMiddleware = express_1.default.json();
exports.app.use(jsonBodyMiddleware);
exports.STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
};
const db = {
    courses: [
        { id: 1, title: "front-end" },
        { id: 2, title: "back-end" },
    ],
};
exports.app.get("/courses", (req, res) => {
    let result = db.courses;
    if (req.query.title) {
        result = db.courses.filter((course) => course.title.includes(req.query.title));
    }
    res.json(result);
});
exports.app.get("/courses/:id", (req, res) => {
    const course = db.courses.find((item) => item.id === Number(req.params.id));
    if (!course) {
        res.sendStatus(exports.STATUS_CODES.NOT_FOUND);
        return;
    }
    res.json(course);
});
exports.app.post("/courses", (req, res) => {
    if (!req.body.title) {
        res.sendStatus(exports.STATUS_CODES.BAD_REQUEST);
        return;
    }
    const new_course = { id: +new Date(), title: req.body.title };
    db.courses.push(new_course);
    res.status(exports.STATUS_CODES.CREATED).json(new_course);
});
exports.app.delete("/courses/:id", (req, res) => {
    db.courses.filter((item) => item.id !== Number(req.params.id));
    res.sendStatus(exports.STATUS_CODES.NO_CONTENT);
});
exports.app.put("/courses/:id", (req, res) => {
    if (!req.body.title) {
        res.sendStatus(exports.STATUS_CODES.BAD_REQUEST);
        return;
    }
    const course = db.courses.find((item) => item.id === Number(req.params.id));
    if (!course) {
        res.sendStatus(exports.STATUS_CODES.NOT_FOUND);
        return;
    }
    course.title = req.body.title;
    res.json(course);
});
exports.app.delete("/__test__/data", (req, res) => {
    db.courses = [];
    res.sendStatus(exports.STATUS_CODES.NO_CONTENT);
});
exports.app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
