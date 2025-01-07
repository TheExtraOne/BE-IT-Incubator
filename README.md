# Blogger platform

Detailed Documentation can be found in Swagger. A simple REST API for blogs and posts, based on Node.js(express) and MongoDB

## Environment variables

- **PORT**: The port for the API gateway (3000).

## Project Structure

The `src` directory contains the core components of our application:

- `db`: Imitation of DataBase.
- `middleware`: Contains middlewares for authorization and validation.
- `models`: Contains TS types.
- `repository`: Contains Data access layer repository.
- `controllers`: Contains Presentation layer controllers.
- `tests`: Contains e2e tests.

## Run local

    yarn watch
    yarn dev

## Testing

    yarn jest
    yarn jest filePath

## TODO

- [+] Refactor DAC (repository) in async way
- [+] Refactor Presentational layer (controllers) in async way
- [+] Add mapping
- [-] Update tests
- [+] Handle testing repository
- [+] Add new fields according to swagger
