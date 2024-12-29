import request from "supertest";
import { app, STATUS_CODES } from "../../src/index";
import { title } from "process";

describe("/course", () => {
  let created_course: { id: number; title: string } | null = null;
  beforeAll(async () => {
    await request(app).delete("/__test__/data");
  });

  it("should return 200 and empty array", async () => {
    await request(app).get("/courses").expect(STATUS_CODES.OK, []);
  });

  it("should return 404 for not existing course", async () => {
    await request(app).get("/courses/9999").expect(STATUS_CODES.NOT_FOUND);
  });

  it("should not create a course with incorrect input data", async () => {
    await request(app)
      .post("/courses")
      .send({ title: "" })
      .expect(STATUS_CODES.BAD_REQUEST);

    await request(app).get("/courses").expect(STATUS_CODES.OK, []);
  });

  it("should create the course with correct input data", async () => {
    const response = await request(app)
      .post("/courses")
      .send({ title: "front-end" })
      .expect(STATUS_CODES.CREATED);

    created_course = response.body;

    expect(created_course).toEqual({
      id: expect.any(Number),
      title: "front-end",
    });

    await request(app)
      .get("/courses")
      .expect(STATUS_CODES.OK, [created_course]);
  });

  it("should not update the course with incorrect input data", async () => {
    await request(app)
      .put(`/courses/${created_course?.id}`)
      .send({ title: "" })
      .expect(STATUS_CODES.BAD_REQUEST);

    await request(app)
      .get(`/courses/${created_course?.id}`)
      .expect(STATUS_CODES.OK, created_course);
  });

  it("should not update course that does not exist", async () => {
    await request(app)
      .put(`/courses/9999`)
      .send({ title: "new_course" })
      .expect(STATUS_CODES.NOT_FOUND);
  });

  it("should update the course with correct input data", async () => {
    await request(app)
      .put(`/courses/${created_course?.id}`)
      .send({ title: "back-end" })
      .expect(STATUS_CODES.OK, { ...created_course, title: "back-end" });

    await request(app)
      .get(`/courses/${created_course?.id}`)
      .expect(STATUS_CODES.OK, { ...created_course, title: "back-end" });
  });
});
