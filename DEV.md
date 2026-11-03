# How to develop

This plugin provide a Strapi with basic fixtures in it with a content type "Article" that already have a custom field configured to have articles and authors. The mini strapi is correctly configured to have the plugin in dev mode

Just start the plugin in watch mode

```bash
$ cd lib && npm run watch
```

and start the Strapi

```bash
$ cd example && npm run dev
```
# Tests

```bash
$ cd lib && npm test
```

Unit tests (Vitest) live in `lib/tests`. GitHub Actions runs them on every pull request and on `master`, with the
type checks, the build and `strapi-plugin verify` (`.github/workflows/tests.yml`).

# Publishing

The package is `lib/`, not the repository root (which is private, so that `npm publish` fails there):

```bash
$ cd lib && npm publish
```

`prepublishOnly` runs the tests, the build and `strapi-plugin verify` first. Bump the version in `lib/package.json`
and `package.json` (and their lockfiles) before.
