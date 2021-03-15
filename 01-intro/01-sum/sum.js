function sum(a, b) {
  if ([a, b].some((elem) => typeof elem !== 'number')) {
    throw new TypeError('');
  }
  return a + b;
}

module.exports = sum;
