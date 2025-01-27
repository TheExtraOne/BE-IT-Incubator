import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import TRefreshTokenMetaControllerViewModel from "../../../src/security/models/RefreshTokenMetaControllerViewModel";
import {
  correctUserBodyParams,
  req,
  userCredentials,
  testDb,
} from "../helpers";

type TSession = {
  browser: string;
  refreshToken: string;
  accessToken: string;
};

describe("device sessions", () => {
  beforeAll(async () => await testDb.setup());
  afterEach(async () => await testDb.clear());
  afterAll(async () => await testDb.teardown());

  const userAgents = {
    chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124",
    firefox: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15) Firefox/89.0",
    safari:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) Safari/605.1.15",
    edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/91.0.864.59",
  };

  describe("login with multiple devices", () => {
    it("should successfully login from 4 different devices and verify sessions", async () => {
      // Create user
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      // Store refresh tokens and device info
      const sessions: TSession[] = [];

      // Login with 4 different user agents
      for (const [browser, userAgent] of Object.entries(userAgents)) {
        const loginResponse = await req
          .post(`${SETTINGS.PATH.AUTH}/login`)
          .set("User-Agent", userAgent)
          .send({
            loginOrEmail: correctUserBodyParams.login,
            password: correctUserBodyParams.password,
          })
          .expect(HTTP_STATUS.OK_200);

        sessions.push({
          browser,
          refreshToken: loginResponse.headers["set-cookie"][0],
          accessToken: loginResponse.body.accessToken,
        });
      }

      // Get devices list with first session's token
      const devicesResponse = await req
        .get(`${SETTINGS.PATH.SECURITY}/devices`)
        .set("Cookie", sessions[0].refreshToken)
        .expect(HTTP_STATUS.OK_200);

      // Verify 4 devices are present
      expect(devicesResponse.body).toHaveLength(4);

      // Store initial lastActiveDate of first device
      const initialLastActiveDate = [
        ...devicesResponse.body[0].lastActiveDate,
      ].join();

      // Update refresh token from first device
      const refreshResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
        .set("Cookie", sessions[0].refreshToken)
        .expect(HTTP_STATUS.OK_200);

      // Get updated devices list
      const updatedDevicesResponse = await req
        .get(`${SETTINGS.PATH.SECURITY}/devices`)
        .set("Cookie", refreshResponse.headers["set-cookie"][0])
        .expect(HTTP_STATUS.OK_200);

      // Verify device count hasn't changed
      expect(updatedDevicesResponse.body).toHaveLength(4);

      // Verify deviceIds haven't changed
      const originalDeviceIds = devicesResponse.body.map(
        (d: TRefreshTokenMetaControllerViewModel) => d.deviceId
      );
      const updatedDeviceIds = updatedDevicesResponse.body.map(
        (d: TRefreshTokenMetaControllerViewModel) => d.deviceId
      );
      expect(updatedDeviceIds).toEqual(originalDeviceIds);

      // Verify lastActiveDate changed only for first device
      const updatedLastActiveDate =
        updatedDevicesResponse.body[0].lastActiveDate;
      console.log("updatedLastActiveDate", updatedLastActiveDate);
      console.log("initialLastActiveDate", initialLastActiveDate);
      expect(updatedLastActiveDate).not.toBe(initialLastActiveDate);

      // Other devices should have same lastActiveDate
      for (let i = 1; i < 4; i++) {
        expect(updatedDevicesResponse.body[i].lastActiveDate).toBe(
          devicesResponse.body[i].lastActiveDate
        );
      }
    });
  });

  describe("error cases", () => {
    it("should return 401 for invalid refresh token", async () => {
      await req
        .get(`${SETTINGS.PATH.SECURITY}/devices`)
        .set("Cookie", "refreshToken=invalid")
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    });

    it("should return 401 for missing refresh token", async () => {
      await req
        .get(`${SETTINGS.PATH.SECURITY}/devices`)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    });

    it("should return 403 when trying to delete another user's session", async () => {
      // Create first user and login
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .set("User-Agent", userAgents.chrome)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: correctUserBodyParams.password,
        })
        .expect(HTTP_STATUS.OK_200);

      // Get devices to get a deviceId
      const devicesResponse = await req
        .get(`${SETTINGS.PATH.SECURITY}/devices`)
        .set("Cookie", loginResponse.headers["set-cookie"][0])
        .expect(HTTP_STATUS.OK_200);

      const deviceId = devicesResponse.body[0].deviceId;

      // Create second user and try to delete first user's session
      const secondUser = {
        ...correctUserBodyParams,
        login: "secondUser",
        email: "second@example.com",
      };

      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(secondUser)
        .expect(HTTP_STATUS.CREATED_201);

      const secondLoginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .set("User-Agent", userAgents.firefox)
        .send({
          loginOrEmail: secondUser.login,
          password: secondUser.password,
        })
        .expect(HTTP_STATUS.OK_200);

      // Try to delete first user's session
      await req
        .delete(`${SETTINGS.PATH.SECURITY}/devices/${deviceId}`)
        .set("Cookie", secondLoginResponse.headers["set-cookie"][0])
        .expect(HTTP_STATUS.FORBIDDEN_403);
    });

    it("should return 404 for non-existent device", async () => {
      // Create and login user
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const loginResponse = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .set("User-Agent", userAgents.chrome)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: correctUserBodyParams.password,
        })
        .expect(HTTP_STATUS.OK_200);

      // Try to delete non-existent device
      await req
        .delete(`${SETTINGS.PATH.SECURITY}/devices/nonexistentdeviceid`)
        .set("Cookie", loginResponse.headers["set-cookie"][0])
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });
  });
});
