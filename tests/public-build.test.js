const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { test } = require("node:test");

const projectRoot = path.resolve(__dirname, "..");

test("l’export public inclut le site statique autorisé sans publier le dépôt ni le backend", async () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "jeuneavenir-public-"));
  const outputDirectory = path.join(temporaryDirectory, "site");

  try {
    const { buildPublicSite } = await import(pathToFileURL(
      path.join(projectRoot, "scripts", "build-public-site.mjs")
    ));
    await buildPublicSite(outputDirectory);

    const sourcePages = fs.readdirSync(projectRoot)
      .filter(file => file.endsWith(".html"))
      .sort();
    const outputPages = fs.readdirSync(outputDirectory)
      .filter(file => file.endsWith(".html"))
      .sort();

    assert.deepEqual(outputPages, sourcePages);
    for (const requiredPath of [
      "assets/icons/favicon.svg",
      "css/style.css",
      "data/questions.json",
      "js/main.js"
    ]) {
      assert.equal(fs.existsSync(path.join(outputDirectory, requiredPath)), true, `${requiredPath} is present`);
    }
    for (const excludedPath of [
      ".env",
      "README.md",
      "backend",
      "docs",
      "documentation",
      "tests"
    ]) {
      assert.equal(fs.existsSync(path.join(outputDirectory, excludedPath)), false, `${excludedPath} is excluded`);
    }
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});
