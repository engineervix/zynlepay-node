# Contributing to zynlepay-node

Thanks for your interest in contributing. This document explains how to set up
the project locally and the conventions we follow.

## Development setup

Prerequisites: Node.js 22 or newer.

```bash
git clone <repository-url>
cd zynlepay-node
npm install
```

## Common tasks

| Task                | Command              |
| ------------------- | -------------------- |
| Run tests           | `npm test`           |
| Run tests (watch)   | `npm run test:watch` |
| Type-check          | `npm run typecheck`  |
| Lint                | `npm run lint`       |
| Format code         | `npm run format`     |
| Build the package   | `npm run build`      |
| Build the docs site | `npm run docs:build` |

## Conventions

- **Tests first.** We practice test-driven development: write a failing test,
  then the implementation, then refactor. See existing tests in `test/` for the
  expected style.
- **No runtime dependencies.** The SDK is intentionally dependency-free. Use the
  Node.js standard library and platform APIs (`fetch`) instead of adding
  packages.
- **Documentation ships with code.** Public APIs carry TSDoc comments
  (`@param`, `@returns`, `@throws`, `@example`). When you change behavior,
  update the TSDoc, the README, and the relevant page under `docs/` in the same
  change.
- **Markdown style.** Documentation follows the Google developer documentation
  style: ATX headings, one sentence per line where practical, fenced code
  blocks with a language tag.
- **Formatting.** Prettier is the source of truth. Run `npm run format` before
  committing; `npm run lint` must pass cleanly.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Make your change with tests and documentation.
3. Ensure `npm test` passes (it runs lint and type-check first).
4. Open a pull request with a clear description of the change and its
   motivation.

## Reporting issues

Open an issue with a minimal reproduction, the SDK version, and the Node.js
version. Do not include real API credentials in issues or pull requests.

## License

By contributing, you agree that your contributions are licensed under the
BSD-3-Clause license. See [LICENSE](LICENSE).
