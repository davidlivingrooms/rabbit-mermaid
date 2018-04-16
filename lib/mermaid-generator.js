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
    const exBuffer = [];
    exchanges.forEach(ex => {
      exBuffer.push(this.genExchangeBlock(ex));
    });

    return exBuffer.join("\n");
  }

  genExchangeBlock(ex) {
    const exBuffer = [];
    const name = capitalize(ex.name);
    exBuffer.push(`subgraph ${name}`);
    switch (ex.type) {
      case "direct":
        exBuffer.push(this.genDirectExchangeBlock(ex));
        break;
      case "fanout":
        exBuffer.push(this.genFanoutExchangeBlock(ex));
        break;
      case "topic":
        // They are identical so far...
        exBuffer.push(this.genDirectExchangeBlock(ex));
        break;
      default:
        throw new Error(`Unrecognized exchange type ${ex.type}`);
    }

    exBuffer.push(`end`);
    return exBuffer.join("\n");
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
        `${name} --routing_key=${binding.routing_key}--> ${
          binding.destination
        }("${binding.destination}")`
      );
    });

    return exBuffer.join("\n");
  }

  genFanoutExchangeBlock(ex) {
    const exBuffer = [];
    const name = capitalize(ex.name);
    exBuffer.push(`${name}(("${name}<br/>(${ex.type})"))`);

    const exQueueBindings = this.findExQBindings(this.json, ex);
    exQueueBindings.forEach(binding => {
      exBuffer.push(
        `${name} --> ${binding.destination}("${binding.destination}")`
      );
    });

    return exBuffer.join("\n");
  }

  genExchangeToExchangeText() {}

  generate() {
    this.stringBuffer.push(`graph ${this.format.chartDirection}`);
    this.stringBuffer.push(this.processExchangeBlocks(this.json));
    // This.genExchangeToExchangeBlocks()
    return this.stringBuffer.join("\n");
  }
}

module.exports = {
  MermaidGenerator
};
