# NgAgUi

Demo workspace for AG-UI protocol using Angular and Express backend

## Install

To install dependencies, run:

```bash
./install.sh
```

## Development server

To start a local development servers, run:

```bash
npm run all:dev
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.
Backend is also runnin on `http://localhost:3000/`

## Building

To build the project run:

```bash
npm run all:build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
