const capitalize = require("capitalize");

class MermaidGenerator {
  constructor(json, opts = {}) {
    this.json = json;
    this.format = this.normalizeOptions(opts);
    this.stringBuffer = [];
  }

  normalizeOptions(opts) {
    const format = {
      chartDirection: opts.chartDirection || "LR"
    };

    return format;
  }

  processExchangeBlocks(json) {
    const exchanges = json.exchanges;
    return exchanges.forEach(ex => {
      switch (ex.type) {
        case "direct":
          this.stringBuffer.push(this.genDirectExchangeBlock(ex));
          break;
        default:
          throw new Error(`Unrecognized exchange type ${ex.type}`);
      }
    });
  }

  findExQBindings(json, ex) {
    return json.bindings.filter(
      binding =>
        binding.destination_type === "queue" && binding.source === ex.name
    );
  }

  genDirectExchangeBlock(ex) {
    const exBuffer = [];
    const name = capitalize(ex.name);
    exBuffer.push(`${name}(("${name}<br/>(${ex.type})"))`);

    const exQueueBindings = this.findExQBindings(this.json, ex);
    exQueueBindings.forEach(binding => {
      exBuffer.push(
        `${name} --> ${binding.destination}["${binding.destination}"]`
      );
    });

    //   "durable": true,
    //   "auto_delete": false,
    return exBuffer.join("\n");
  }

  genTopicExchangeBlock() {}

  genFanoutExchangeBlock() {}

  genExchangeToExchangeText() {}

  generate() {
    this.stringBuffer.push(`graph ${this.format.chartDirection}`);
    this.processExchangeBlocks(this.json);
    // This.genExchangeToExchangeBlocks()
    return this.stringBuffer.join("\n");
  }
}

module.exports = {
  MermaidGenerator
};
