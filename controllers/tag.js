const express = require('express');
const fs = require('../helpers/fs');
const directory = require('../helpers/directory');
const router = express.Router();
const config = require('../config');
const _ = require('lodash');

router.get('/', async function (req, res) {
  const list = _.filter(await directory.listOfFiles(config.general.tags), (t) => /\.json$/.test(t));
  if (list.length <= 0) return res.send(404);
  res.send(JSON.parse(await fs.readFile(list[0])));
});


module.exports = router;