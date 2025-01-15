import { SETTINGS, STATUS } from "../../../src/settings";
import {
  correctUserBodyParams,
  incorrectId,
  req,
  userCredentials,
} from "../helpers";
import { client, connectToDb } from "../../../src/data-access/db";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("DELETE /users/:id", () => {
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
    it("should return 401 if unauthorized", async () => {
      await req
        .delete(`${SETTINGS.PATH.USERS}/${incorrectId}`)
        .expect(STATUS.UNAUTHORIZED_401);
    });

    it("should return 401 if wrong credentials", async () => {
      await req
        .delete(`${SETTINGS.PATH.USERS}/${incorrectId}`)
        .set({ Authorization: userCredentials.incorrect })
        .expect(STATUS.UNAUTHORIZED_401);
    });
  });

  describe("Error cases", () => {
    it("should return 404 if user doesn't exist", async () => {
      await req
        .delete(`${SETTINGS.PATH.USERS}/${incorrectId}`)
        .set({ Authorization: userCredentials.correct })
        .expect(STATUS.NOT_FOUND_404);
    });
  });

  describe("Success case", () => {
    it("should delete existing user", async () => {
      const {
        body: { id },
      } = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(STATUS.CREATED_201);

      await req
        .delete(`${SETTINGS.PATH.USERS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .expect(STATUS.NO_CONTENT_204);

      const res = await req
        .get(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .expect(STATUS.OK_200);

      expect(res.body.items).toEqual([]);
    });
  });
});
