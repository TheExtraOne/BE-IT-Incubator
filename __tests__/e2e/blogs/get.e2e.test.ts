import app from "../../../src/app";
import { agent } from "supertest";
import { resetBlogsDB } from "../../../src/db-in-memory/db-in-memory";
import { SETTINGS, STATUS } from "../../../src/settings";
import { mockBlogs } from "../helpers";

const req = agent(app);

describe("GET /blogs", () => {
  beforeEach(async () => resetBlogsDB());

  it("should return 200 and an empty array if the db is empty", async () => {
    const res = await req.get(SETTINGS.PATH.BLOGS).expect(STATUS.OK_200);

    expect(res.body).toEqual([]);
  });

  it("should return 200 and an array with blogs if the db is not empty", async () => {
    resetBlogsDB(mockBlogs);
    const res = await req.get(SETTINGS.PATH.BLOGS).expect(STATUS.OK_200);

    expect(res.body).toEqual(mockBlogs);
  });

  it("should return 404 in case if id was passed, but the db is empty", async () => {
    await req.get(`${SETTINGS.PATH.BLOGS}/1`).expect(STATUS.NOT_FOUND_404);
  });

  it("should return 404 in case if id is not matching the db", async () => {
    resetBlogsDB(mockBlogs);
    await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs.length + 1}`)
      .expect(STATUS.NOT_FOUND_404);
  });

  it("should return 200 and blog (with id, name, description and websiteUrl) in case if id is matching the db", async () => {
    resetBlogsDB(mockBlogs);
    const { body } = await req
      .get(`${SETTINGS.PATH.BLOGS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);

    const { id, name, description, websiteUrl } = mockBlogs[0];
    expect(body.id).toBe(id);
    expect(body.name).toBe(name);
    expect(body.description).toBe(description);
    expect(body.websiteUrl).toBe(websiteUrl);
  });
});
