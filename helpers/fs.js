const fs = require('fs');
const util = require('util');

exports.readDir = util.promisify(fs.readdir);
exports.stat = util.promisify(fs.stat);
exports.readFile = util.promisify(fs.readFile);
exports.writeFile = util.promisify(fs.writeFile);
exports.unlink = util.promisify(fs.unlink);
