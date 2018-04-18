const assert = require("assert");
const { MermaidGenerator } = require("../mermaid-generator.js");
const direct = require("./direct.json");
const fanout = require("./fanout.json");
const topic = require("./topic.json");
const multiple = require("./multiple.json");
const exchangeToExhange = require("./exchangeToExchange.json");
const unknownExchange = require("./unknownExchange.json");

describe("MermaidGenerator", () => {
  it("generates a string", () => {
    const mermaidGenerator = new MermaidGenerator(direct, {});
    assert(typeof mermaidGenerator.generate(), "string");
  });

  it("generates a direct exchange block with queue bindings", () => {
    const mermaidGenerator = new MermaidGenerator(direct, {});
    const expectedString = `graph LR
subgraph Images
Images(("Images<br/>(direct)"))
Images --routing_key=images.archive--> archiver1("archiver1")
Images --routing_key=images.archive--> archiver2("archiver2")
Images --routing_key=images.crop--> cropper("cropper")
Images --routing_key=images.resize--> resizer("resizer")
end`;

    assert.deepEqual(mermaidGenerator.generate(), expectedString);
  });

  it("ignores exchange types it does not recognize", () => {
    const mermaidGenerator = new MermaidGenerator(unknownExchange, {});
    const expectedString = `graph LR
subgraph Images
Images(("Images<br/>(direct)"))
Images --routing_key=images.archive--> archiver1("archiver1")
Images --routing_key=images.archive--> archiver2("archiver2")
Images --routing_key=images.crop--> cropper("cropper")
Images --routing_key=images.resize--> resizer("resizer")
end`;

    assert.deepEqual(mermaidGenerator.generate(), expectedString);
  });

  it("generates a fanout exchange block with queue bindings", () => {
    const mermaidGenerator = new MermaidGenerator(fanout, {});
    const expectedString = `graph LR
subgraph Images
Images(("Images<br/>(fanout)"))
Images --> archiver1("archiver1")
Images --> archiver2("archiver2")
Images --> cropper("cropper")
Images --> resizer("resizer")
end`;

    assert.deepEqual(mermaidGenerator.generate(), expectedString);
  });

  it("generates a topic-based exchange block with queue bindings", () => {
    const mermaidGenerator = new MermaidGenerator(topic, {});
    const expectedString = `graph LR
subgraph Images
Images(("Images<br/>(topic)"))
Images --routing_key=*.archive--> archiver1("archiver1")
Images --routing_key=*.archive--> archiver2("archiver2")
Images --routing_key=*.crop--> cropper("cropper")
Images --routing_key=*.resize--> resizer("resizer")
end`;

    assert.deepEqual(mermaidGenerator.generate(), expectedString);
  });

  it("handles topology files that contain multiple exchanges", () => {
    const mermaidGenerator = new MermaidGenerator(multiple, {});
    const expectedString = `graph LR
subgraph JPEG
JPEG(("JPEG<br/>(direct)"))
JPEG --routing_key=images.archive--> jarchiver1("jarchiver1")
JPEG --routing_key=images.archive--> jarchiver2("jarchiver2")
JPEG --routing_key=images.crop--> jcropper("jcropper")
JPEG --routing_key=images.resize--> jresizer("jresizer")
end
subgraph PNG
PNG(("PNG<br/>(fanout)"))
PNG --> parchiver1("parchiver1")
PNG --> parchiver2("parchiver2")
PNG --> pcropper("pcropper")
PNG --> presizer("presizer")
end
subgraph GIF
GIF(("GIF<br/>(topic)"))
GIF --routing_key=*.archive--> garchiver1("garchiver1")
GIF --routing_key=*.archive--> garchiver2("garchiver2")
GIF --routing_key=*.crop--> gcropper("gcropper")
GIF --routing_key=*.resize--> gresizer("gresizer")
end`;

    assert.deepEqual(mermaidGenerator.generate(), expectedString);
  });

  it("can filter exchanges", () => {
    const mermaidGenerator = new MermaidGenerator(multiple);
    const expectedString = `graph LR
subgraph JPEG
JPEG(("JPEG<br/>(direct)"))
JPEG --routing_key=images.archive--> jarchiver1("jarchiver1")
JPEG --routing_key=images.archive--> jarchiver2("jarchiver2")
JPEG --routing_key=images.crop--> jcropper("jcropper")
JPEG --routing_key=images.resize--> jresizer("jresizer")
end`;

    const opts = {
      exchanges: ["JPEG"]
    };

    assert.deepEqual(mermaidGenerator.generate(opts), expectedString);
  });

  it("handles topology files that contain exchange to exchange bindings", () => {
    const mermaidGenerator = new MermaidGenerator(exchangeToExhange, {});
    const expectedString = `graph LR
subgraph JPEG
JPEG(("JPEG<br/>(direct)"))
JPEG --routing_key=images.archive--> jarchiver1("jarchiver1")
JPEG --routing_key=images.archive--> jarchiver2("jarchiver2")
JPEG --routing_key=images.crop--> jcropper("jcropper")
JPEG --routing_key=images.resize--> jresizer("jresizer")
end
subgraph PNG
PNG(("PNG<br/>(fanout)"))
PNG --> parchiver1("parchiver1")
PNG --> parchiver2("parchiver2")
PNG --> pcropper("pcropper")
PNG --> presizer("presizer")
end
subgraph GIF
GIF(("GIF<br/>(topic)"))
GIF --routing_key=*.archive--> garchiver1("garchiver1")
GIF --routing_key=*.archive--> garchiver2("garchiver2")
GIF --routing_key=*.crop--> gcropper("gcropper")
GIF --routing_key=*.resize--> gresizer("gresizer")
end
JPEG --> PNG
PNG --> GIF`;

    assert.deepEqual(mermaidGenerator.generate(), expectedString);
  });
});
