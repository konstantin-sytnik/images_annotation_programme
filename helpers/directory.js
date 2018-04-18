const path = require('path');
const fs = require('./fs');
const _ = require('./lodash');

exports.listOfFiles = async function(dirPath){
  async function recursion(currentPath){
    await _.each(await fs.readDir(currentPath), async (item) => {
      item = '/' + item;
      if ((await fs.stat(currentPath + item)).isDirectory()) {
        return await recursion(currentPath + item);
      }
      result.push(currentPath + item);
    });
  }

  dirPath = path.resolve(dirPath);
  const result = [];
  await recursion(dirPath);
  return result;
}
