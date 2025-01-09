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

- [+] Refactor DAC (repository) in async way
- [+] Refactor Presentational layer (controllers) in async way
- [+] Add mongo DB
- [+] Add mapping
- [+] Update tests
- [+] Add new fields according to swagger
