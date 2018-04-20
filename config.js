const path = require('path');

exports.general = {
  port: 3201,
  images: path.resolve('./data/images'),
  annotations: path.resolve('./data/annotations'),
  tags: path.resolve('./data/tags'),
  collection: 'collection_01',
  ratio: 80, //80%
};
