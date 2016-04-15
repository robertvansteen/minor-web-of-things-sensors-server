var Datastore = require('nedb');

var data = new Datastore({ filename: 'data.db', autoload: true });

module.exports = data;
