const assert = require("assert");
const { MermaidGenerator } = require("../mermaid-generator.js");
const json = require("./test.json");

describe("MermaidGenerator", () => {
  it("can generate a string", () => {
    const mermaidGenerator = new MermaidGenerator(json, {});
    assert(typeof mermaidGenerator.generate(), "string");
  });
});
