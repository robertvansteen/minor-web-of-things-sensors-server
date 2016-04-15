var env = require('./env');
var mosca = require('mosca');
var Datastore = require('nedb');

var data = require('./data');
var devices = require('./devices');
var mqtt_regex = require('mqtt-regex');

var settings = {
  port: env.PUBSUB_PORT,
  http: {
    port: env.PUBSUB_WS_PORT,
    bundle: true,
    static: './'
  }
};

var topics = {
  'register': 'onRegister',
}

var server = new mosca.Server(settings);
server.on('ready', setup);

function setup() {
  console.log('Mosca server is up and running')
}

server.on('clientConnected', function(client) {
  console.log('client connected', client.id);
});

server.on('subscribed', function(topic, client) {
  console.log('Client: ' + client.id + ' subscribed to: ' + topic);
});

server.on('published', function(packet, client) {
  var sender = (client) ? client.id : 'Broker';

  console.log('');
  console.log('New message published');
  console.log('Topic: ' + packet.topic);
  console.log('From: ' + sender);
  console.log('Payload: ', packet.payload.toString());

  if (!client) return false;

  Object.keys(messageHandlers).forEach(function(handler) {
    var pattern = mqtt_regex(handler);
    var results = pattern.regex.exec(packet.topic);
    if(pattern.exec(packet.topic)) {
      var fn = messageHandlers[handler];
      fn(packet, client, pattern.getParams(results));
    }
  });
});

messageHandlers = {
  'register': function(packet, client) {
    devices.insert({ _id: client.id });
  },

  'lights/+id/status': function(packet, client, params) {
    var path = 'lights.' + params.id;
    var payload = JSON.parse(packet.payload.toString());
    var value = parseInt(payload.value);
    devices.update({ _id: client.id }, { $set: { [path]: { value: value } } });
  },
};

module.exports = server;
