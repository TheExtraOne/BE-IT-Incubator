import app from "../../../src/app";
import { agent } from "supertest";
import { resetPostsDB } from "../../../src/db/db";
import { SETTINGS, STATUS } from "../../../src/settings";
import { mockPosts, userCredentials } from "../helpers";

const req = agent(app);

describe("DELETE /posts", () => {
  beforeEach(async () => resetPostsDB(mockPosts));

  // Authorization
  it("should return 401 if user is not authorized (authorized no headers)", async () => {
    await req
      .delete(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(3);
  });

  it("should return 401 if login or password is incorrect", async () => {
    await req
      .delete(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(3);
  });

  it("should return 404 if id is not matching", async () => {
    await req
      .delete(`${SETTINGS.PATH.POSTS}/${mockPosts.length + 1}`)
      .set({ Authorization: userCredentials.correct })
      .expect(STATUS.NOT_FOUND_404);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(3);
  });

  it("should return 204 if id is matching", async () => {
    await req
      .delete(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .expect(STATUS.NO_CONTENT_204);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(2);
  });
});
