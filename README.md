# Blogger platform

Detailed Documentation can be found in Swagger. A simple REST API for blogs and posts, based on Node.js(express) and MongoDB

## Environment variables

- **PORT**: The port for the API gateway (3000).
- **MONGO_URL**: Connection string to MongoDb.
- **LOGIN_PASSWORD**: Credentials for authorization.

## Project Structure

The `src` directory contains the core components of our application:

- `middleware`: Contains middlewares for authorization and validation.
- `repository`: Contains Data access layer repository.
- `controllers`: Contains Presentation layer controllers.
- `tests`: Contains e2e tests.

## Run local

    yarn watch
    yarn dev

## Testing

    yarn jest
    yarn jest filePath
    yarn jest:coverage

## TODO

- [+] Add business layer (service) fro blogs
- [+] Add business layer (service) fro posts
- [-] Add Pagination With Sorting for blogs
- [-] Add Pagination With Sorting for posts
- [+] Add SearchNameTerm for blogs (register doesn't matter)
- [-] Create a new endpoint POST - blogs/{id}/posts (for creating post for a specific blog)
- [-] Create a new endpoint GET - blogs/{id}/posts (for getting posts for a specific blog)
- [-] Update tests
