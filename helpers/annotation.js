const fs = require('./fs');
const parseString = require('util').promisify(require('xml2js').parseString);
const Builder = require('xml2js').Builder;
const _ = require('lodash');
const S = require('./utils').string;
const N = require('./utils').number;

exports.readFile = async function(path){
  function recursion(node){
    _.each(node, (v, k) => {
      if (_.isArray(v) && k !== 'object') {
        node[k] = v[0];
        if (_.isObject(v[0])){
          recursion(v[0]);
        }
        return;
      }
      if (_.isArray(v)) return _.each(v, (v2) => recursion(v2));
      recursion(v);
    })
  }
  const doc = await parseString(await fs.readFile(path, 'utf8'));
  recursion(doc)
  if (_.isEmpty(doc.annotation)) throw new Error('Xml file is not annotation');
  return doc.annotation
};

exports.writeFile = async function(path, annotation){
  const inputAnnotation = _.extend({}, annotation);
  inputAnnotation.size_part = _.extend({}, annotation.size_part);
  const object = {
    annotation: {
      folder: [S(inputAnnotation.folder)],
      filename: [S(inputAnnotation.filename)],
      path: [''],
      source: [{
        database: ['Unknown']
      }],
      size_part: [{
        width: [N(inputAnnotation.size_part.width)],
        height: [N(inputAnnotation.size_part.height)],
        depth: [3],
      }],
      segmented: [0],
      object: _.map(annotation.object,(o) => {
        const inputObject = _.extend({}, o);
        inputObject.bndbox = _.extend({}, o.bndbox);
        return {
          name: [S(inputObject.name)],
          pose: ['Unspecified'],
          truncated: [0],
          difficult: [0],
          bndbox: [{
            xmin: [N(inputObject.bndbox.xmin)],
            ymin: [N(inputObject.bndbox.ymin)],
            xmax: [N(inputObject.bndbox.xmax)],
            ymax: [N(inputObject.bndbox.ymax)],
          }]
        }
      })
    }
  };
  await fs.writeFile(path, new Builder().buildObject(object));
};
