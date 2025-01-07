import app from "../../../src/app";
import { agent } from "supertest";
import { resetPostsDB } from "../../../src/db-in-memory/db-in-memory";
import { SETTINGS, STATUS } from "../../../src/settings";
import { mockPosts } from "../helpers";

const req = agent(app);

describe("GET /posts", () => {
  beforeEach(async () => resetPostsDB());

  it("should return 200 and an empty array if the db is empty", async () => {
    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);

    expect(res.body).toEqual([]);
  });

  it("should return 200 and an array with posts if the db is not empty", async () => {
    resetPostsDB(mockPosts);
    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);

    expect(res.body).toEqual(mockPosts);
  });

  it("should return 404 in case if id was passed, but the db is empty", async () => {
    await req.get(`${SETTINGS.PATH.POSTS}/1`).expect(STATUS.NOT_FOUND_404);
  });

  it("should return 404 in case if id is not matching the db", async () => {
    resetPostsDB(mockPosts);
    await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts.length + 1}`)
      .expect(STATUS.NOT_FOUND_404);
  });

  it("should return 200 and a post (with id, title, shortDescription, content,blogId and blogName) in case if id is matching the db", async () => {
    resetPostsDB(mockPosts);
    const { body } = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);

    const { id, title, shortDescription, content, blogId, blogName } =
      mockPosts[0];
    expect(body.id).toBe(id);
    expect(body.title).toBe(title);
    expect(body.shortDescription).toBe(shortDescription);
    expect(body.content).toBe(content);
    expect(body.blogId).toBe(blogId);
    expect(body.blogName).toBe(blogName);
  });
});
