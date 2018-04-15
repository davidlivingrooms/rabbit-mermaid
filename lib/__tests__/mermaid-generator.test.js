const assert = require("assert");
const { MermaidGenerator } = require("../mermaid-generator.js");
const direct = require("./direct.json");

describe("MermaidGenerator", () => {
  it("generates a string", () => {
    const mermaidGenerator = new MermaidGenerator(direct, {});
    assert(typeof mermaidGenerator.generate(), "string");
  });

  it("generates a direct exchange block with queue bindings", () => {
    const mermaidGenerator = new MermaidGenerator(direct, {});
    const expectedString = `graph LR
Images(("Images<br/>(direct)"))
Images --> archiver1["archiver1"]
Images --> archiver2["archiver2"]
Images --> cropper["cropper"]
Images --> resizer["resizer"]`;

    assert.deepEqual(mermaidGenerator.generate(), expectedString);
  });
});
