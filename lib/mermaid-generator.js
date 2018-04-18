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

  isSupportedExchange(ex) {
    return ex.type === "direct" || ex.type === "fanout" || ex.type === "topic";
  }

  processExchangeBlocks(json) {
    const exchanges = json.exchanges;
    const exBuffer = [];
    const supportedExchanges = exchanges.filter(ex =>
      this.isSupportedExchange(ex)
    );
    supportedExchanges.forEach(ex => {
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

  findExToExBindings(json) {
    return json.bindings.filter(
      binding => binding.destination_type === "exchange"
    );
  }

  genExchangeToExchangeBlocks(json) {
    const exBuffer = [];
    const exToExBindings = this.findExToExBindings(json);
    exToExBindings.forEach(binding => {
      const sourceName = capitalize(binding.source);
      const destinationName = capitalize(binding.destination);
      exBuffer.push(`${sourceName} --> ${destinationName}`);
    });

    return exBuffer.join("\n");
  }

  generate() {
    this.stringBuffer.push(`graph ${this.format.chartDirection}`);
    this.stringBuffer.push(this.processExchangeBlocks(this.json));

    // Not all topology files will have ex to ex bindings. Avoid pushing an empty string  so that we don't add
    // unneeded empty lines.
    const exToExText = this.genExchangeToExchangeBlocks(this.json);
    if (exToExText) {
      this.stringBuffer.push(exToExText);
    }
    return this.stringBuffer.join("\n");
  }
}

module.exports = {
  MermaidGenerator
};
