import TBlogControllerInputModel from "../../../src/features/blogs/types/BlogControllerInputModel";
import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  correctBlogBodyParams,
  incorrectId,
  req,
  testDb,
  userCredentials,
} from "../helpers";

const newBodyParams: TBlogControllerInputModel = {
  name: "New name",
  description: "New description",
  websiteUrl: "https://refactoring.guru",
};

const unchangedResponse = {
  ...correctBlogBodyParams,
  createdAt: expect.any(String),
  id: expect.any(String),
  isMembership: false,
};

describe("PUT /blogs", () => {
  let id: string;
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  beforeEach(async () => {
    const {
      body: { id: blogId },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams);

    id = blogId;
  });

  describe("Authorization", () => {
    it("should return 401 if user is not authorized (authorized no headers)", async () => {
      await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .send(newBodyParams)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    it("should return 401 if login or password is incorrect", async () => {
      await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.incorrect })
        .send(newBodyParams)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);
  });
  describe("Updating post", () => {
    // Id matching
    it("should return 404 in case if id is not matching the db", async () => {
      await req
        .put(`${SETTINGS.PATH.BLOGS}/${incorrectId}`)
        .set({ Authorization: userCredentials.correct })
        .send(newBodyParams)
        .expect(HTTP_STATUS.NOT_FOUND_404);

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);
    // Success case
    it("should return 204 if login, password and body params are correct. A proper blog should be updated", async () => {
      await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(newBodyParams)
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const { body } = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(body).toEqual({
        ...newBodyParams,
        createdAt: expect.any(String),
        id: expect.any(String),
        isMembership: false,
      });
    }, 8000);
  });
  describe("Validation", () => {
    // Name validation
    it("should return 400 and error if name is not string", async () => {
      const bodyParams = {
        ...newBodyParams,
        name: null,
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [{ field: "name", message: "Incorrect type" }],
      });

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    it("should return 400 and error if name is empty string", async () => {
      const bodyParams = {
        ...newBodyParams,
        name: "    ",
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "name", message: "Name is a required field" },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    it("should return 400 and error if name is too long", async () => {
      const bodyParams = {
        ...newBodyParams,
        name: "Blog Name".repeat(100),
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "name", message: "Incorrect length. Min = 1, max = 15" },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    // Description validation
    it("should return 400 and error if description is not string", async () => {
      const bodyParams = {
        ...newBodyParams,
        description: null,
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [{ field: "description", message: "Incorrect type" }],
      });

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    it("should return 400 and error if description is an empty string", async () => {
      const bodyParams = {
        ...newBodyParams,
        description: "",
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "description", message: "Description is a required field" },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    it("should return 400 and error if description is too long", async () => {
      const bodyParams = {
        ...newBodyParams,
        description: "Best refactoring practice and design patterns".repeat(
          100
        ),
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
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

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    // WebsiteUrl validation
    it("should return 400 and error if websiteUrl is not string", async () => {
      const bodyParams = {
        ...newBodyParams,
        websiteUrl: 123,
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [{ field: "websiteUrl", message: "Incorrect type" }],
      });

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    it("should return 400 and error if websiteUrl is an empty string", async () => {
      const bodyParams = {
        ...newBodyParams,
        websiteUrl: "",
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "websiteUrl", message: "WebsiteUrl is a required field" },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    it("should return 400 and error if websiteUrl is too long", async () => {
      const bodyParams = {
        ...newBodyParams,
        websiteUrl: "https://refactoring.guru".repeat(100),
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
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

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    it("should return 400 and error if websiteUrl does not match the reg exp", async () => {
      const bodyParams = {
        ...newBodyParams,
        websiteUrl: "htt:///refactoring.guru",
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
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

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    // Combined validation
    it("should return 400 and array with length === 1 if one field contains two errors", async () => {
      const bodyParams = {
        ...newBodyParams,
        websiteUrl: "htt:///refactoring.guru".repeat(100),
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body.errorsMessages.length).toBe(1);

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);

    it("should return 400 and array with errors if couple of fields are incorrect", async () => {
      const bodyParams = {
        name: "",
        description: null,
        websiteUrl: "htt:///refactoring.guru",
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.BLOGS}/${id}`)
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

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual(unchangedResponse);
    }, 8000);
  });
});
