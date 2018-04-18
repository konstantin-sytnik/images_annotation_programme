const express = require('express');
const fs = require('../helpers/fs');
const directory = require('../helpers/directory');
const router = express.Router();
const config = require('../config');
const _ = require('lodash');

router.get('/', async function (req, res) {
  const imagePathInput = req.query.path;
  const list = await directory.listOfFiles(config.general.images);
  const imagePath = _.find(list, (i) => i.includes(imagePathInput));
  if (!imagePath) return res.send(404);
  res.send(await fs.readFile(imagePath));
});


module.exports = router;