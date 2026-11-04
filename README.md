# NgAgUi

Demo workspace for AG-UI protocol using Angular and Express backend

## Teaching the demo in three lessons

The checked-in app enables all three lessons. Choose a lesson at two composition
points: `projects/chat-backend/src/server.ts` and
`projects/chat/src/app/app.config.ts`. The additions inside the implementation
are wrapped in `/**  --- step 2 code start --- */` / `end` markers and the
matching step 3 markers, so they can be introduced as grouped code blocks.

### 1. Streaming chat

On the backend, start with:

```ts
connectChat(socket, openai);
```

On the frontend, provide `ApiService` alongside the application's Angular providers.
Omit the `ToolService`, `registerAppTools` initializer, and `ChatStateService`
provider entries for this lesson.

Follow the flow in `api.service.ts` → backend `chat.ts` → `stream-response.ts`
→ frontend `chat.service.ts`. A run sends one model request, forwards text chunks,
and emits one completion event. `previous_response_id` preserves conversation
context between user messages. The conversation queue processes messages in order.

### 2. Add frontend tools

Add the backend tools module:

```ts
connectChat(socket, openai, {
  tools: connectTools(socket),
});
```

Add these Angular providers:

```ts
ToolService,
provideAppInitializer(registerAppTools),
```

`features/chat/tools/index.ts` registers frontend tool definitions and callbacks.
The run carries those definitions to the backend. Backend `tools.ts` executes
tool calls through frontend acknowledgements, feeds results back to the model,
and continues the same run. Frontend `tool.service.ts` invokes the registered
actions. The text streaming function from lesson 1 is reused for every step.
One `RUN_FINISHED` closes the entire run.

Form tools already work in this lesson: they update the UI and return their
results. Live manual edits become shared agent context in lesson 3.

### 3. Add shared state

Add the state module to the same backend call:

```ts
connectChat(socket, openai, {
  tools: connectTools(socket),
  state: connectSharedState(socket),
});
```

Add `ChatStateService` to the Angular providers. Campaign form sources register
with this optional service. Its `prepareRun()` supplies `RunAgentInput.state`;
live manual edits use the versioned `frontend-state` Socket.IO extension.
Backend `shared-state.ts` emits AG-UI snapshots and deltas, and frontend
`chat-state.service.ts` consumes them. That service contains the recovery and
stale-tool safeguards. `fast-json-patch` is confined to these state modules.
The Socket.IO extensions used in this lesson are:

- `frontend-state`: `{state, revision}` for a baseline or `{delta, baseRevision, revision}` for edits.
- `request-frontend-state` and `request-state-snapshot`: recover either side's baseline.
- AG-UI `CUSTOM` named `tool-state-version`: identifies which state revision a tool used.

Backend `event` messages carry AG-UI `STATE_SNAPSHOT` and `STATE_DELTA` updates.

The form owns editable values. Backend state events acknowledge shared context;
tool actions change the form. This avoids echo loops and overwriting newer edits.
`MESSAGES_SNAPSHOT` belongs to a future conversation-restoration lesson.

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
