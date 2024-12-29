const http = require("http");
const fs = require("fs");

// let requestCount = 0;
const readFile = (path) => {
  return new Promise((res, rej) => {
    fs.readFile(path, (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  });
};

const server = http.createServer(async (request, response) => {
  switch (request.url) {
    case "/":
    case "/home": {
      const data = await readFile("pages/home.html");
      response.write(data);
      break;
    }

    case "/about": {
      const data = await readFile("pages/about.html");
      response.write(data);
      break;
    }

    default:
      response.write("404 NOT FOUND");
      break;
  }

  // if (request?.method === "GET" && request.url !== "/favicon.ico") requestCount++;

  response.end();
});
server.listen(3003);
