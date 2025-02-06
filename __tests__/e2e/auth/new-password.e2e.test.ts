import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import UsersRepository from "../../../src/users/infrastructure/users-repository";
import {
  correctUserBodyParams,
  req,
  userCredentials,
  testDb,
} from "../helpers";

describe("POST /auth/new-password", () => {
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("New password success/failure", () => {
    it("should return 204 if recovery code is valid and new password meets requirements", async () => {
      // Create user first
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      // Request password recovery
      await req
        .post(`${SETTINGS.PATH.AUTH}/password-recovery`)
        .send({ email: correctUserBodyParams.email })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Get user with recovery code
      const user = await new UsersRepository().getByLoginOrEmail(
        correctUserBodyParams.email
      );
      expect(user).not.toBeNull();
      const recoveryCode = user?.passwordResetConfirmation?.recoveryCode;
      expect(recoveryCode).toBeDefined();

      // Set new password
      await req
        .post(`${SETTINGS.PATH.AUTH}/new-password`)
        .send({
          newPassword: "newPassword123",
          recoveryCode,
        })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Try to login with new password
      await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: "newPassword123",
        })
        .expect(HTTP_STATUS.OK_200);

      // Verify that old password no longer works
      await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: correctUserBodyParams.password,
        })
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    }, 8000);

    it("should return 400 if recovery code is invalid", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/new-password`)
        .send({
          newPassword: "newPassword123",
          recoveryCode: "invalid-code",
        })
        .expect(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);
  });

  describe("Input validation", () => {
    it("should return 400 if newPassword is not provided", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/new-password`)
        .send({
          recoveryCode: "some-code",
        })
        .expect(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);

    it("should return 400 if recoveryCode is not provided", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/new-password`)
        .send({
          newPassword: "newPassword123",
        })
        .expect(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);

    it("should return 400 if newPassword does not meet requirements", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/new-password`)
        .send({
          newPassword: "short",
          recoveryCode: "some-code",
        })
        .expect(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);
  });

  describe("Rate limiting", () => {
    it("should return 429 after exceeding 5 requests within 10 seconds", async () => {
      const newPasswordData = {
        newPassword: "newPassword123",
        recoveryCode: "some-code",
      };

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await req
          .post(`${SETTINGS.PATH.AUTH}/new-password`)
          .send(newPasswordData)
          .expect(HTTP_STATUS.BAD_REQUEST_400);
      }

      // 6th request should be rate limited
      await req
        .post(`${SETTINGS.PATH.AUTH}/new-password`)
        .send(newPasswordData)
        .expect(HTTP_STATUS.TOO_MANY_REQUESTS_429);
    }, 8000);
  });
});
