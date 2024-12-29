"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
const jsonBodyMiddleware = express_1.default.json();
app.use(jsonBodyMiddleware);
let courses = [
    { id: 1, title: "front-end" },
    { id: 2, title: "back-end" },
];
app.get("/courses", (req, res) => {
    let result = courses;
    if (req.query.title) {
        result = courses.filter((course) => course.title.includes(req.query.title));
    }
    res.json(result);
});
app.get("/courses/:id", (req, res) => {
    const course = courses.find((item) => item.id === Number(req.params.id));
    if (!course) {
        res.sendStatus(400);
        return;
    }
    res.json(course);
});
app.post("/courses", (req, res) => {
    if (!req.body.title) {
        res.sendStatus(404);
        return;
    }
    const new_course = { id: +new Date(), title: req.body.title };
    courses.push(new_course);
    res.status(201).json(new_course);
});
app.delete("/courses/:id", (req, res) => {
    courses = [...courses.filter((item) => item.id !== Number(req.params.id))];
    res.sendStatus(204);
});
app.put("/courses/:id", (req, res) => {
    if (!req.body.title) {
        res.sendStatus(404);
        return;
    }
    const course = courses.find((item) => item.id === Number(req.params.id));
    if (!course) {
        res.sendStatus(400);
        return;
    }
    course.title = req.body.title;
    res.json(course);
});
// app.get("/samurais", (req, res) => {
//   res.send("Hello samurais!");
// });
// app.post("/samurais", (req, res) => {
//   res.send("We created samurai!");
// });
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
