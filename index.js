const express = require('express');
const expressStatic   = require('express-static');
const _ = require('lodash');
 
const app = express();

_.each(require('./controllers'), (r, k) => {
  app.use('/' + k, r);
});
app.use(expressStatic(__dirname + '/public'));
 
const server = app.listen(3000, function(){
  console.log('Server is running at %s', server.address().port);
});
