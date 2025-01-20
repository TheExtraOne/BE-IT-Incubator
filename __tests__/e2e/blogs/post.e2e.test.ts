import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import { correctBlogBodyParams, req, userCredentials } from "../helpers";
import { client, connectToDb } from "../../../src/db/db";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("POST /blogs", () => {
  let server: MongoMemoryServer;
  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    const uri = server.getUri();

    await connectToDb(uri);
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  });

  afterEach(async () => await req.delete(`${SETTINGS.PATH.TESTING}/all-data`));

  afterAll(async () => {
    await client.close();
    await server.stop();
  });

  describe("Authorization", () => {
    it("should return 401 if user is not authorized (authorized no headers)", async () => {
      await req
        .post(SETTINGS.PATH.BLOGS)
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const { body } = await req
        .get(SETTINGS.PATH.BLOGS)
        .expect(HTTP_STATUS.OK_200);
      expect(body.items.length).toBe(0);
    });

    it("should return 401 if login or password is incorrect", async () => {
      await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.incorrect })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const { body } = await req
        .get(SETTINGS.PATH.BLOGS)
        .expect(HTTP_STATUS.OK_200);
      expect(body.items.length).toBe(0);
    });
  });
  describe("Blog creation", () => {
    it("should return 201 with new blog if login, password and body params are correct. New blog should contain id, name, description and websiteUrl", async () => {
      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      expect(body).toEqual({
        ...correctBlogBodyParams,
        createdAt: expect.any(String),
        id: expect.any(String),
        isMembership: false,
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(1);
    });
  });
  describe("Body params validation", () => {
    // Name validation
    it("should return 400 and error if name is not string", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        name: null,
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [{ field: "name", message: "Incorrect type" }],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    it("should return 400 and error if name is empty string", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        name: "    ",
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "name", message: "Name is a required field" },
        ],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    it("should return 400 and error if name is too long", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        name: "Blog Name".repeat(100),
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "name", message: "Incorrect length. Min = 1, max = 15" },
        ],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    // Description validation
    it("should return 400 and error if description is not string", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        description: null,
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [{ field: "description", message: "Incorrect type" }],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    it("should return 400 and error if description is an empty string", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        description: "",
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "description", message: "Description is a required field" },
        ],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    it("should return 400 and error if description is too long", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        description: "Best refactoring practice and design patterns".repeat(
          100
        ),
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "description",
            message: "Incorrect length. Min = 1, max = 500",
          },
        ],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    // WebsiteUrl validation
    it("should return 400 and error if websiteUrl is not string", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        websiteUrl: 123,
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [{ field: "websiteUrl", message: "Incorrect type" }],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    it("should return 400 and error if websiteUrl is an empty string", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        websiteUrl: "",
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "websiteUrl", message: "WebsiteUrl is a required field" },
        ],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    it("should return 400 and error if websiteUrl is too long", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        websiteUrl: "https://refactoring.guru".repeat(100),
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "websiteUrl",
            message: "Incorrect length. Min = 1, max = 100",
          },
        ],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    it("should return 400 and error if websiteUrl does not match the reg exp", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        websiteUrl: "htt:///refactoring.guru",
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "websiteUrl",
            message: "Incorrect URL value",
          },
        ],
      });

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });

    // Combined validation
    it("should return 400 and array with length === 1 if one field contains two errors", async () => {
      const bodyParams = {
        ...correctBlogBodyParams,
        websiteUrl: "htt:///refactoring.guru".repeat(100),
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body.errorsMessages.length).toBe(1);
    });

    it("should return 400 and array with errors if couple of fields are incorrect", async () => {
      const bodyParams = {
        name: "",
        description: null,
        websiteUrl: "htt:///refactoring.guru",
      };

      const { body } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

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

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });
  });
});
