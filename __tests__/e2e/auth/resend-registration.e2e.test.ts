import { emailService } from "../../../src/adapters/email-service";
import {
  HTTP_STATUS,
  RESULT_STATUS,
  SETTINGS,
} from "../../../src/common/settings";
import {
  correctUserBodyParams,
  req,
  testDb,
  userCredentials,
} from "../helpers";

describe("POST /auth/registration-email-resending", () => {
  beforeAll(async () => await testDb.setup());

  beforeEach(async () => {
    await req
      .post(`${SETTINGS.PATH.AUTH}/registration`)
      .send(correctUserBodyParams)
      .expect(HTTP_STATUS.NO_CONTENT_204);

    emailService.sendEmail = jest
      .fn()
      .mockImplementation(
        (userEmail: string, subject: string, message: string) =>
          Promise.resolve({
            status: RESULT_STATUS.SUCCESS,
            data: "mailId",
            extensions: [],
          })
      );
  });

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Rate limiting", () => {
    it("should return 429 after exceeding 5 requests within 10 seconds", async () => {
      const makeRequest = () =>
        req.post(`${SETTINGS.PATH.AUTH}/registration-email-resending`).send({
          email: correctUserBodyParams.email,
        });

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const response = await makeRequest();
        expect(response.status).not.toBe(HTTP_STATUS.TOO_MANY_REQUESTS_429);
      }

      // 6th request should return 429
      const response = await makeRequest();
      expect(response.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS_429);
    }, 8000);
  });

  describe("Email resending success/failure", () => {
    it("should return 204 if email exists and not confirmed", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: correctUserBodyParams.email });

      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT_204);
    }, 8000);

    it("should return 400 if email doesn't exist", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: "nonexistent@gmail.com" });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);

    it("should return 400 if email is already confirmed", async () => {
      await testDb.clear();
      // Creating user by admin => email already confirmed
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      // Try to resend confirmation
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: correctUserBodyParams.email });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);
  });

  describe("Input validation", () => {
    it("should return 400 if email is not provided", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({});

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);

    it("should return 400 if email is empty", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: "" });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);

    it("should return 400 if email format is invalid", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: "invalid-email" });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);
  });
});
