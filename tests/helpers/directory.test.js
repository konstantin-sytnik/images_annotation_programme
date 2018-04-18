const directory = require('../../helpers/directory');
const A = require('chai').assert;
const path = require('path');
const _ = require('lodash');


describe('Helpers', function () {
  describe('directory', function () {
    describe('listOfFiles', function () {
      it('should show list of files', async function () {
        const result = await directory.listOfFiles('./tests');
        A.isArray(result);
      });
      it('paths are resolved', async function () {
        const result = await directory.listOfFiles('./tests');
        _.each(result, (v) => A.equal(v, path.resolve(v)))
      });
    })
  })
})