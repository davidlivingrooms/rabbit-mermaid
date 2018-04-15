# rabbit-mermaid [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> Generate markdown flowcharts of your rabbitmq topology.

rabbit-mermaid takes your rabbitmq topology files and turns them into
markdown flowcharts. Direct, fanout, and topic-based exchanges are supported.

## Installation

```sh
$ npm install --save rabbit-mermaid
```

## Usage

```js
const rabbitmermaid = require("rabbit-mermaid");
const topology = require("./topology.json");

rabbitmermaid(topology);
```

## License

MIT © [David Salas]()

[npm-image]: https://badge.fury.io/js/rabbit-mermaid.svg
[npm-url]: https://npmjs.org/package/rabbit-mermaid
[travis-image]: https://travis-ci.org/davidlivingrooms/rabbit-mermaid.svg?branch=master
[travis-url]: https://travis-ci.org/davidlivingrooms/rabbit-mermaid
[daviddm-image]: https://david-dm.org/davidlivingrooms/rabbit-mermaid.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/davidlivingrooms/rabbit-mermaid
[coveralls-image]: https://coveralls.io/repos/davidlivingrooms/rabbit-mermaid/badge.svg
[coveralls-url]: https://coveralls.io/r/davidlivingrooms/rabbit-mermaid
