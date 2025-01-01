import { app } from "../src/app";
import { agent } from "supertest";
import { setDB } from "../src/db/db";
import { SETTINGS, STATUS, TResolutions } from "../src/settings";
import { TVideoCreateInputModel } from "../src/models/VideoCreateModel";
import { TVideoUpdateModel } from "../src/models/VideoUpdateModel";

const req = agent(app);
const id = 0;
const mockDb = {
  videos: [
    {
      id,
      title: "Shape of my heart",
      author: "Sting",
      canBeDownloaded: true,
      minAgeRestriction: null,
      createdAt: "2024-12-31T07:32:45.862Z",
      publicationDate: "2024-12-31T07:32:45.862Z",
      availableResolutions: ["P144" as TResolutions],
    },
  ],
};

describe("/videos", () => {
  beforeEach(async () => setDB());

  it("should get an empty array if the db is empty", async () => {
    const { body } = await req.get(SETTINGS.PATH.VIDEOS).expect(STATUS.OK_200);

    expect(body).toEqual([]);
  });

  it("should get an array with results if the db is not empty", async () => {
    setDB(mockDb);

    const { body } = await req.get(SETTINGS.PATH.VIDEOS).expect(STATUS.OK_200);

    expect(body.length).toBe(1);
  });

  it("should return 404 for the course if the db is empty or the id is not matching", async () => {
    await req.get(`${SETTINGS.PATH.VIDEOS}/15`).expect(STATUS.NOT_FOUND_404);
  });

  it("should return an entity if the id is matching and the db is not empty", async () => {
    setDB(mockDb);

    const { body } = await req
      .get(`${SETTINGS.PATH.VIDEOS}/${id}`)
      .expect(STATUS.OK_200);

    expect(body).toEqual(mockDb.videos[0]);
  });

  it("should not create the entity  and return an error if the input data is incorrect", async () => {
    const res1 = await req
      .post(SETTINGS.PATH.VIDEOS)
      .send({ title: "", author: "Igy Pop" })
      .expect(STATUS.BAD_REQUEST_400);

    expect(res1.body).toEqual({
      errorsMessages: [
        { message: "Title is a required field", field: "title" },
      ],
    });

    const res2 = await req
      .post(SETTINGS.PATH.VIDEOS)
      .send({ title: "   ", author: "Igy Pop" })
      .expect(STATUS.BAD_REQUEST_400);

    expect(res2.body).toEqual({
      errorsMessages: [
        { message: "Title is a required field", field: "title" },
      ],
    });

    const res3 = await req
      .post(SETTINGS.PATH.VIDEOS)
      .send({ title: "Long title".repeat(100), author: "" })
      .expect(STATUS.BAD_REQUEST_400);

    expect(res3.body).toEqual({
      errorsMessages: [
        { message: "Max length should be <= 40", field: "title" },
        { message: "Author is a required field", field: "author" },
      ],
    });

    const res4 = await req
      .post(SETTINGS.PATH.VIDEOS)
      .send({ title: ["Title in array"], author: "Lond author".repeat(100) })
      .expect(STATUS.BAD_REQUEST_400);

    expect(res4.body).toEqual({
      errorsMessages: [
        { message: "Incorrect type", field: "title" },
        { message: "Max length should be <= 20", field: "author" },
      ],
    });

    const res5 = await req
      .post(SETTINGS.PATH.VIDEOS)
      .send({ title: {}, author: {}, availableResolutions: "" })
      .expect(STATUS.BAD_REQUEST_400);

    expect(res5.body).toEqual({
      errorsMessages: [
        { message: "Incorrect type", field: "title" },
        { message: "Incorrect type", field: "author" },
        { message: "Incorrect type", field: "availableResolutions" },
      ],
    });

    const res6 = await req
      .post(SETTINGS.PATH.VIDEOS)
      .send({ title: "Title", author: "Author", availableResolutions: ["P1"] })
      .expect(STATUS.BAD_REQUEST_400);

    expect(res6.body).toEqual({
      errorsMessages: [
        {
          message:
            "There is no such resolution. Available resolutions: P144 P240 P360 P480 P720 P1080 P1440 P2160",
          field: "availableResolutions",
        },
      ],
    });

    await req.get(SETTINGS.PATH.VIDEOS).expect(STATUS.OK_200, []);
  });

  it("should create an entity if the input data is correct", async () => {
    const bodyReq: TVideoCreateInputModel = {
      title: "Smoke on the water",
      author: "Deep Purple",
    };
    await req
      .post(SETTINGS.PATH.VIDEOS)
      .send(bodyReq)
      .expect(STATUS.CREATED_201);

    const { body } = await req.get(SETTINGS.PATH.VIDEOS).expect(STATUS.OK_200);
    expect(body.length).toBe(1);
    expect(body[0].title).toBe(bodyReq.title);
  });

  it("should not update the entity and return 404 if the id is not matching", async () => {
    const bodyReq: TVideoUpdateModel = {
      title: "Smoke on the water",
      author: "Deep Purple",
    };

    await req
      .put(`${SETTINGS.PATH.VIDEOS}/${id}`)
      .send(bodyReq)
      .expect(STATUS.NOT_FOUND_404);

    const { body } = await req.get(SETTINGS.PATH.VIDEOS).expect(STATUS.OK_200);
    expect(body.length).toBe(0);
  });

  it("should not update the entity and return 400 if the input data is incorrect", async () => {
    const bodyReq: TVideoUpdateModel = {
      title: "Smoke on the water",
      author: "",
    };
    setDB(mockDb);

    await req
      .put(`${SETTINGS.PATH.VIDEOS}/${id}`)
      .send(bodyReq)
      .expect(STATUS.BAD_REQUEST_400);

    const { body } = await req
      .get(`${SETTINGS.PATH.VIDEOS}/${id}`)
      .expect(STATUS.OK_200);
    expect(body.title).toBe(mockDb.videos[0].title);
  });

  it("should update the entity and return 204 if the input data is correct", async () => {
    const bodyReq: TVideoUpdateModel = {
      title: "Smoke on the water",
      author: "Deep Purple",
    };
    setDB(mockDb);

    await req
      .put(`${SETTINGS.PATH.VIDEOS}/${id}`)
      .send(bodyReq)
      .expect(STATUS.NO_CONTENT_204);

    const { body } = await req
      .get(`${SETTINGS.PATH.VIDEOS}/${id}`)
      .expect(STATUS.OK_200);
    expect(body.title).toBe(bodyReq.title);
  });

  it("should not delete the entity and return 404 if the id is not matching", async () => {
    await req.delete(`${SETTINGS.PATH.VIDEOS}/0`).expect(STATUS.NOT_FOUND_404);
  });

  it("should delete the entity and return 204 if the id is matching", async () => {
    setDB(mockDb);

    await req.delete(`${SETTINGS.PATH.VIDEOS}/0`).expect(STATUS.NO_CONTENT_204);

    const res = await req.get(SETTINGS.PATH.VIDEOS).expect(STATUS.OK_200);
    expect(res.body.length).toBe(0);
  });
});
