const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.options = options;
    this.total = 0;
  }

  _transform(chunk, encoding, callback) {
    let error = null; let data = null;
    this.total += chunk.length;
    if (this.total <= this.options.limit) {
      data = chunk;
    } else {
      error = new LimitExceededError();
    }
    callback(error, data);
  }
}

module.exports = LimitSizeStream;
