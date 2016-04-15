var Datastore = require('nedb');

var devices = new Datastore({ filename: 'devices.db', autoload: true });

module.exports = devices;
