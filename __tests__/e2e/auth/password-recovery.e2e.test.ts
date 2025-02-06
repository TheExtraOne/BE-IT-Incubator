import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import {
  correctUserBodyParams,
  req,
  userCredentials,
  testDb,
} from "../helpers";

describe("POST /auth/password-recovery", () => {
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Password recovery success/failure", () => {
    it("should return 204 if email exists in the system", async () => {
      // Create user first
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/password-recovery`)
        .send({ email: correctUserBodyParams.email });

      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT_204);
    }, 8000);

    it("should return 204 even if email doesn't exist (to prevent user enumeration)", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/password-recovery`)
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT_204);
    }, 8000);
  });

  describe("Input validation", () => {
    it("should return 400 if email is not provided", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/password-recovery`)
        .send({});

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);

    it("should return 400 if email has invalid format", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/password-recovery`)
        .send({ email: "invalid-email" });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);
  });

  describe("Rate limiting", () => {
    it("should return 429 after exceeding 5 requests within 10 seconds", async () => {
      const recoveryData = { email: correctUserBodyParams.email };

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/password-recovery`)
          .send(recoveryData);

        expect(response.status).not.toBe(HTTP_STATUS.TOO_MANY_REQUESTS_429);
      }

      // 6th request should return 429
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/password-recovery`)
        .send(recoveryData);

      expect(response.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS_429);
    }, 8000);
  });
});
