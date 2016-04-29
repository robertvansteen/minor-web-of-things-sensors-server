var Datastore = require('nedb');

var data = new Datastore({ filename: 'disturbance.db', autoload: true });

module.exports = data;
