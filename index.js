const express = require('express');
const expressStatic   = require('express-static');
const _ = require('lodash');
const config = require('./config');
 
const app = express();

_.each(require('./controllers'), (r, k) => {
  app.use('/' + k, r);
});
app.use(expressStatic(__dirname + '/public'));
 
const server = app.listen(config.general.port, function(){
  console.log('Server is running at %s', server.address().port);
});
