const express = require('express');
const fs = require('../helpers/fs');
const directory = require('../helpers/directory');
const annotation = require('../helpers/annotation');
const router = express.Router();
const config = require('../config');
const _ = require('lodash');
const N = require('../helpers/utils').number;
const R = require('../helpers/utils').random;
const path = require('path');
const urlencodedParser = require('body-parser').urlencoded({extended: false});

router.post('/next', async function (req, res) {
  const imageList = await directory.listOfFiles(config.general.images);
  const annotationList = await directory.listOfFiles(config.general.annotations);

  let annotatedCounter = 0;
  const data = _.compact(_.map(imageList, (image) => {
    if (!image.includes(config.general.collection)) return null;
    const imageRelativePath = image.replace(config.general.images, '');
    const parsedImage = path.parse(path.normalize(imageRelativePath));
    if (!parsedImage.name) return null;
    const annotation = _.find(annotationList, (a) => a.includes(parsedImage.name));
    if (!!annotation) annotatedCounter++;
    return {
      imageName: parsedImage.name,
      imageFolder: parsedImage.dir,
      imageId: parsedImage.base,
      imagePath: imageRelativePath,
      annotation
    }
  }));

  if (data.length === 0) {
    console.log('No data found');
    return res.send(404);
  }

  let currentData = null;
  if (annotatedCounter === data.length || annotatedCounter === 0) {
    currentData = data;
  } else {
    let condition = R(100) > config.general.ratio ? ((d) => d.annotation) : ((d) => !d.annotation);
    currentData = _.filter(data, condition);
  }

  const currentSample = currentData[Math.floor(R(currentData.length))];

  const result = {
    url: 'image?path=' + currentSample.imagePath,
    id: currentSample.imageId,
    folder: currentSample.imageFolder,
    annotations: []
  };

  if (currentSample.annotation) {
    const annotationData = await annotation.readFile(currentSample.annotation);
    result.width = annotationData.size_part.width;
    result.height = annotationData.size_part.height;
    result.annotations = _.map(annotationData.object, (o) => ({
      tag: o.name,
      x: N(o.bndbox.xmin),
      y: N(o.bndbox.ymin),
      width: N(o.bndbox.xmax) - N(o.bndbox.xmin),
      height: N(o.bndbox.ymax) - N(o.bndbox.ymin),
    }))
  }

  res.send(result);
});

router.post('/save', urlencodedParser, async function (req, res) {
  const sendInfo = req.body.sendInfo;
  const inputData = JSON.parse(sendInfo);

  const annotationData = {
    folder: inputData.folder,
    filename: inputData.id,
    size_part: {
      width: N(inputData.width),
      height: N(inputData.height),
      depth: 3,
    },
    segmented: 0,
    object: _.map(inputData.annotations, (a) => ({
      name: a.tag,
      bndbox: {
        xmin: N(a.x),
        ymin: N(a.y),
        xmax: N(a.x) + N(a.width),
        ymax: N(a.y) + N(a.height),
      }
    }))
  };

  await annotation.writeFile(
    path.resolve(config.general.annotations, path.parse(inputData.id).name + '.xml'),
    annotationData);

  res.send({
    status: 'success',
    message: 'Created'
  });
});

module.exports = router;