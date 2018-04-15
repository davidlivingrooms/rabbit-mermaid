class MermaidGenerator {
  constructor(json, opts = {}) {
    const format = normalizeOptions(opts);

    this.json = json;
    this.format = format;
  }

  generate() {
    return "";
  }
}

function normalizeOptions(opts) {
  const format = {
    chartDirection: opts.chartDirection || "LR"
  };

  return format;
}

module.exports = {
  MermaidGenerator
};
