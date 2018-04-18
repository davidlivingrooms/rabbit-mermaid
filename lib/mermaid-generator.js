const capitalize = require("capitalize");

class MermaidGenerator {
  constructor(json) {
    this.json = json;
    this.stringBuffer = [];
  }

  normalizeOptions(opts) {
    const options = {
      chartDirection: opts.chartDirection || "LR",
      exchanges: opts.exchanges || []
    };

    return options;
  }

  isSupportedExchange(ex) {
    return ex.type === "direct" || ex.type === "fanout" || ex.type === "topic";
  }

  isRelevantExchange(ex, exchangesOpt) {
    return exchangesOpt.find(exOpt => ex.name === exOpt) !== undefined;
  }

  processExchangeBlocks(json, opts) {
    const exBuffer = [];
    const supportedExchanges = json.exchanges.filter(ex =>
      this.isSupportedExchange(ex)
    );

    let exchanges;
    if (opts.exchanges.length === 0) {
      // No exchanges option passed in. Everything gets processed
      exchanges = supportedExchanges;
    } else {
      exchanges = supportedExchanges.filter(ex =>
        this.isRelevantExchange(ex, opts.exchanges)
      );
    }

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

  generate(opts = {}) {
    const options = this.normalizeOptions(opts);
    this.stringBuffer.push(`graph ${options.chartDirection}`);
    this.stringBuffer.push(this.processExchangeBlocks(this.json, options));

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
