const S = exports.string = function (data) {
  if (data === 0) return '0';
  return String(data || '');
};

const N = exports.number = function (data) {
  if (isNaN(+data)) return 0;
  return Math.round(Number(data) * 100000) / 100000;
};

exports.random = function (min, max) {
  if (max === undefined) return Math.random() * N(min);
  return N(min) + Math.random() * (N(max) - N(min))
};