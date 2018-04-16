const assert = require("assert");
const { MermaidGenerator } = require("../mermaid-generator.js");
const direct = require("./direct.json");
const fanout = require("./fanout.json");

describe("MermaidGenerator", () => {
  it("generates a string", () => {
    const mermaidGenerator = new MermaidGenerator(direct, {});
    assert(typeof mermaidGenerator.generate(), "string");
  });

  it("generates a direct exchange block with queue bindings", () => {
    const mermaidGenerator = new MermaidGenerator(direct, {});
    const expectedString = `graph LR
Images(("Images<br/>(direct)"))
Images --routing_key=images.archive--> archiver1("archiver1")
Images --routing_key=images.archive--> archiver2("archiver2")
Images --routing_key=images.crop--> cropper("cropper")
Images --routing_key=images.resize--> resizer("resizer")`;

    assert.deepEqual(mermaidGenerator.generate(), expectedString);
  });

  it("generates a fanout exchange block with queue bindings", () => {
    const mermaidGenerator = new MermaidGenerator(fanout, {});
    const expectedString = `graph LR
Images(("Images<br/>(fanout)"))
Images --> archiver1("archiver1")
Images --> archiver2("archiver2")
Images --> cropper("cropper")
Images --> resizer("resizer")`;

    assert.deepEqual(mermaidGenerator.generate(), expectedString);
  });
});
