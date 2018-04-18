const config = require('../../config');
const A = require('chai').assert;
const annotation = require('../../helpers/annotation');
const directory = require('../../helpers/directory');
const fs = require('../../helpers/fs');

describe('Helpers', function(){
  describe('annotation', function(){
    describe('readFile', function(){
      let annotaionList = null;
      before(async () => {
        annotaionList = await directory.listOfFiles(config.general.annotations);
      })

      it('should return annotaion object', async () => {
        A.containsAllKeys(await annotation.readFile(annotaionList[0]),
          ['folder', 'filename', 'size_part', 'object']);
      });
      it('object should be array', async () => {
        A.isArray((await annotation.readFile(annotaionList[0])).object);
      })
    });

    describe('writeFile', function(){
      let annotaionList = null;
      before(async () => {
        annotaionList = await directory.listOfFiles(config.general.annotations);
      })

      it('should be serializable', async () => {
        await annotation.writeFile('test.xml', await annotation.readFile(annotaionList[0]));
        A.deepEqual(await annotation.readFile('test.xml'), await annotation.readFile(annotaionList[0]))
      });

      after(async () => {
        await fs.unlink('test.xml');
      })
    })
  })
})