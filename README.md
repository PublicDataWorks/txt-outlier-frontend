Install the dependencies:

```bash
yarn install
```

## Usage

To start the project in dev mode:

```bash
yarn dev
```

Open the project in browser using this link:
[https://0.0.0.0:5173](https://0.0.0.0:5173)

To build the project:

```bash
yarn build
```

## Running Tests

### Setup E2E test

```bash
cp cypress.env.json.sample cypress.env.json
```

### Run tests

To run unit test:

```bash
yarn test:unit
```

To run end-to-end tests interactively:

```bash
yarn test:e2e:open
```

To run end-to-end tests headless-ly:

```bash
yarn test:e2e:run
```

To run all tests (unit and e2e) and merge coverage reports (to run in CI
workflows):

```bash
yarn coverage
```

## Contributing

### Coding style

Install pre-commit hook:

```bash
yarn prepare
```

Toolings:

We are using `Prettier` to format the code, please add it to your editor/IDE and
make sure that it picks up the right config of this project
at `/.prettierrc.cjs`.

The pre-commit hook will run `yarn lint` before every commit. You can also
install `eslint` plugin to your editor/IDE to see the visualized error while
coding.

Please note that the unassigned imports (i.e. `import './*.scss'`) are ignored
by the linter, please put them together with the sibling import group.

## Translation

See detail [here](./i18n-script/README.md)
