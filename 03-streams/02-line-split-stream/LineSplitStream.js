const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.substr = '';
  }

  _transform(chunk, encoding, callback) {
    const lines = `${this.substr}${chunk.toString()}`.split(os.EOL);
    this.substr = lines.pop();
    lines && lines.map((line) => this.push(line));
    callback();
  }

  _flush(callback) {
    this.substr && this.push(this.substr);
    callback();
  }
}

module.exports = LineSplitStream;
