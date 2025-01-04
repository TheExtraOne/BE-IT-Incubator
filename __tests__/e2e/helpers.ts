import { getEncodedCredentials } from "../../src/middleware/authorization-middleware";
import { SETTINGS } from "../../src/settings";

export const mockBlogs = [
  {
    id: "1",
    name: "Blog 1 name",
    description: "Blog 1 description",
    websiteUrl: "https://doka.guide/js",
  },
  {
    id: "2",
    name: "Blog 2 name",
    description: "Blog 2 description",
    websiteUrl: "https://javascript.info/",
  },
];

export const mockPosts = [
  {
    id: "1",
    title: "Post 1 title",
    shortDescription: "Post 1 shortDescription",
    content: "Post 1 content",
    blogId: "1",
    blogName: "Blog 1 name",
  },
  {
    id: "2",
    title: "Post 2 title",
    shortDescription: "Post 2 shortDescription",
    content: "Post 2 content",
    blogId: "1",
    blogName: "Blog 1 name",
  },
  {
    id: "3",
    title: "Post 3 title",
    shortDescription: "Post 3 shortDescription",
    content: "Post 3 content",
    blogId: "2",
    blogName: "Blog 2 name",
  },
];

export const userCredentials = {
  correct: `Basic ${getEncodedCredentials(SETTINGS.ADMIN)}`,
  incorrect: `Basic ${getEncodedCredentials("babyBlossom:sup!r_secure")}`,
};
