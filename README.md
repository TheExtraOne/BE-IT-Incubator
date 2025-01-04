# Blogger platform

Detailed Documentation can be found in Swagger

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

- [+] Add DB, type, model
- [+] Add GET methods, types, models
- [+] Cover with tests
- [+] Add Auth
- [+] Add POST methods, types, models
- [+] Cover with tests
- [+] Add validation for POST
- [+] Add error handlers
- [+] Cover with tests
- [+] Add PUT methods, types, models
- [+] Cover with tests
- [+] Add validation for PUT
- [+] Cover with tests
- [+] Add DELETE methods, types, models
- [+] Cover with tests
- [+] Add validation for DELETE
- [+] Cover with tests
