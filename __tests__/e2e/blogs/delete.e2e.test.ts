import app from "../../../src/app";
import { agent } from "supertest";
import { resetBlogsDB } from "../../../src/db-in-memory/db-in-memory";
import { SETTINGS, STATUS } from "../../../src/settings";
import { mockBlogs, userCredentials } from "../helpers";

const req = agent(app);

describe("DELETE /blogs", () => {
  beforeEach(async () => resetBlogsDB(mockBlogs));

  // Authorization
  it("should return 401 if user is not authorized (authorized no headers)", async () => {
    await req
      .delete(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req.get(SETTINGS.PATH.BLOGS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(2);
  });

  it("should return 401 if login or password is incorrect", async () => {
    await req
      .delete(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req.get(SETTINGS.PATH.BLOGS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(2);
  });

  it("should return 404 if id is not matching", async () => {
    await req
      .delete(`${SETTINGS.PATH.BLOGS}/${mockBlogs.length + 1}`)
      .set({ Authorization: userCredentials.correct })
      .expect(STATUS.NOT_FOUND_404);

    const res = await req.get(SETTINGS.PATH.BLOGS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(2);
  });

  it("should return 204 if id is matching", async () => {
    await req
      .delete(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .expect(STATUS.NO_CONTENT_204);

    const res = await req.get(SETTINGS.PATH.BLOGS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(1);
  });
});
