/* eslint-env node, jest */

"use strict";

const fs = require("fs");
const path = require("path");
const Transformer = require("..");

const rootDir = path.resolve(".");
const casesDir = path.resolve("test/cases");
const casesDirV10 = path.resolve("test/cases-v10");
const implsDir = path.resolve("test/implementations");
const outputDir = path.resolve("test/output");
const outputDirV10 = path.resolve("test/output/v10");

beforeAll(() => {
  const transformer = new Transformer();
  transformer.addSource(casesDir, implsDir);

  const transformerV10 = new Transformer({
    genericWrap: true,
    externalType: {
      url: ["URL", "URLSearchParams"]
    }
  });
  transformerV10.addSource(casesDirV10, implsDir);

  return Promise.all([
    transformer.generate(outputDir),
    transformerV10.generate(outputDirV10)
  ]);
});

const testDirs = [
  fs.readdirSync(casesDir),
  fs.readdirSync(casesDirV10)
];

for (const idlFiles of testDirs) {
  for (const idlFile of idlFiles) {
    test(idlFile, () => {
      // FIXME: wrong `outputDir`...
      const outputFile = path.resolve(outputDir, path.basename(idlFile, ".webidl") + ".js");
      const output = fs.readFileSync(outputFile, { encoding: "utf-8" });

      expect(output).toMatchSnapshot();
    });
  }
}

test("bundle-entry.js", () => {
  const outputFile = path.resolve(outputDir, "bundle-entry.js");
  const output = fs.readFileSync(outputFile, { encoding: "utf-8" });

  expect(output).toMatchSnapshot();
});

test("utils.js", () => {
  const input = fs.readFileSync(path.resolve(rootDir, "lib/output/utils.js"), { encoding: "utf-8" });
  const output = fs.readFileSync(path.resolve(outputDir, "utils.js"), { encoding: "utf-8" });
  expect(output).toBe(input);
});
