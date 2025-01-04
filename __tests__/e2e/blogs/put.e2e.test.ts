import app from "../../../src/app";
import { agent } from "supertest";
import { resetBlogsDB } from "../../../src/db/db";
import { SETTINGS, STATUS } from "../../../src/settings";
import { mockBlogs, userCredentials } from "../helpers";
import TBlogInputModel from "../../../src/models/BlogInputModel";

const req = agent(app);
const correctBodyParams: TBlogInputModel = {
  name: "Refactor Guru",
  description: "Best refactoring practice and design patterns",
  websiteUrl: "https://refactoring.guru",
};

describe("PUT /blogs", () => {
  beforeEach(async () => resetBlogsDB(mockBlogs));

  // Authorization
  it("should return 401 if user is not authorized (authorized no headers)", async () => {
    await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .send(correctBodyParams)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 401 if login or password is incorrect", async () => {
    await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.incorrect })
      .send(correctBodyParams)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  // Id matching
  it("should return 404 in case if id is not matching the db", async () => {
    await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs.length + 1}`)
      .set({ Authorization: userCredentials.correct })
      .send(correctBodyParams)
      .expect(STATUS.NOT_FOUND_404);

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  // Name validation
  it("should return 400 and error if name is not string", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      name: null,
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "name", message: "Incorrect type" }],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if name is empty string", async () => {
    const bodyParams = {
      ...correctBodyParams,
      name: "    ",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "name", message: "Name is a required field" }],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if name is too long", async () => {
    const bodyParams = {
      ...correctBodyParams,
      name: "Blog Name".repeat(100),
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        { field: "name", message: "Incorrect length. Min = 1, max = 15" },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  // Description validation
  it("should return 400 and error if description is not string", async () => {
    const bodyParams = {
      ...correctBodyParams,
      description: null,
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "description", message: "Incorrect type" }],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if description is an empty string", async () => {
    const bodyParams = {
      ...correctBodyParams,
      description: "",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        { field: "description", message: "Description is a required field" },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if description is too long", async () => {
    const bodyParams = {
      ...correctBodyParams,
      description: "Best refactoring practice and design patterns".repeat(100),
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "description",
          message: "Incorrect length. Min = 1, max = 500",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  // WebsiteUrl validation
  it("should return 400 and error if websiteUrl is not string", async () => {
    const bodyParams = {
      ...correctBodyParams,
      websiteUrl: 123,
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "websiteUrl", message: "Incorrect type" }],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if websiteUrl is an empty string", async () => {
    const bodyParams = {
      ...correctBodyParams,
      websiteUrl: "",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        { field: "websiteUrl", message: "WebsiteUrl is a required field" },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if websiteUrl is too long", async () => {
    const bodyParams = {
      ...correctBodyParams,
      websiteUrl: "https://refactoring.guru".repeat(100),
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "websiteUrl",
          message: "Incorrect length. Min = 1, max = 100",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if websiteUrl does not match the reg exp", async () => {
    const bodyParams = {
      ...correctBodyParams,
      websiteUrl: "htt:///refactoring.guru",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "websiteUrl",
          message: "Incorrect URL value",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  // Combined validation
  it("should return 400 and array with length === 1 if one field contains two errors", async () => {
    const bodyParams = {
      ...correctBodyParams,
      websiteUrl: "htt:///refactoring.guru".repeat(100),
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body.errorsMessages.length).toBe(1);
  });

  it("should return 400 and array with errors if couple of fields are incorrect", async () => {
    const bodyParams = {
      name: "",
      description: null,
      websiteUrl: "htt:///refactoring.guru",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "name",
          message: "Name is a required field",
        },
        {
          field: "description",
          message: "Incorrect type",
        },
        {
          field: "websiteUrl",
          message: "Incorrect URL value",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBodyParams,
      id: expect.any(String),
    });
  });

  // Success case
  it("should return 204 if login, password and body params are correct. A proper blog should be updated", async () => {
    resetBlogsDB(mockBlogs);
    await req
      .put(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(correctBodyParams)
      .expect(STATUS.NO_CONTENT_204);

    const { body } = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(body).toEqual({ ...correctBodyParams, id: expect.any(String) });
  });
});
