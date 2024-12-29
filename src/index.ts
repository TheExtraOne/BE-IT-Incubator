import express from "express";

export const app = express();
const port = 3000;

const jsonBodyMiddleware = express.json();
app.use(jsonBodyMiddleware);

export const STATUS_CODES = {
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

app.get("/courses", (req, res) => {
  let result = db.courses;

  if (req.query.title) {
    result = db.courses.filter((course) =>
      course.title.includes(req.query.title as string)
    );
  }

  res.json(result);
});

app.get("/courses/:id", (req, res) => {
  const course = db.courses.find((item) => item.id === Number(req.params.id));
  if (!course) {
    res.sendStatus(STATUS_CODES.NOT_FOUND);
    return;
  }

  res.json(course);
});

app.post("/courses", (req, res) => {
  if (!req.body.title) {
    res.sendStatus(STATUS_CODES.BAD_REQUEST);
    return;
  }
  const new_course = { id: +new Date(), title: req.body.title };
  db.courses.push(new_course);

  res.status(STATUS_CODES.CREATED).json(new_course);
});

app.delete("/courses/:id", (req, res) => {
  db.courses.filter((item) => item.id !== Number(req.params.id));

  res.sendStatus(STATUS_CODES.NO_CONTENT);
});

app.put("/courses/:id", (req, res) => {
  if (!req.body.title) {
    res.sendStatus(STATUS_CODES.BAD_REQUEST);
    return;
  }

  const course = db.courses.find((item) => item.id === Number(req.params.id));
  if (!course) {
    res.sendStatus(STATUS_CODES.NOT_FOUND);
    return;
  }
  course.title = req.body.title;

  res.json(course);
});

app.delete("/__test__/data", (req, res) => {
  db.courses = [];
  res.sendStatus(STATUS_CODES.NO_CONTENT);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
