var env = require('./env');
var mosca = require('mosca');
var moment = require('moment');
var Datastore = require('nedb');
var request = require('request');

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

var server = new mosca.Server(settings);
server.on('ready', setup);

function setup() {
  console.log('Mosca server is up and running on ' + env.PUBSUB_PORT);
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
  '+device/ping': function(packet, client) {
    devices.update({ _id: client.id }, { $set: { last_ping: moment().unix() } });
  },

  '+device/register': function(packet, client) {
    var payload = JSON.parse(packet.payload.toString());
    devices.update({ _id: client.id }, { $set: { label: payload.label, last_ping: moment().unix() } }, { upsert: true });
  },

  '+device/register/output': function(packet, client) {
    var payload = JSON.parse(packet.payload.toString());
    devices.update({ _id: client.id }, { $set: { output: payload.devices } });
  },

  '+device/register/input': function(packet, client) {
    var payload = JSON.parse(packet.payload.toString());
    devices.update({ _id: client.id }, { $set: { input: payload.devices } });
  },

  '+device/input/+sensor': function(packet, client, params) {
    var payload = JSON.parse(packet.payload.toString());
    var now = moment().unix();

    data.insert({ sensor: params.sensor, value: payload.value, date: moment().unix(), device: client.id });
  },

  '+device/input/temp': function(packet, client, params) {
    var payload = JSON.parse(packet.payload.toString());
    console.log(payload);
    var red = Math.floor(0 + (255 * (payload.value / 30)));
    var green = Math.floor(255 - (255 * (payload.value / 50)));
    var blue = Math.floor(0 + (255 * (payload.value / 300)));
    var topic = params.device + '/output/strip/set';
    server.publish({ topic: topic, payload: JSON.stringify({ r: 255, g: green, b: 0 }) });
  },

  '+device/output/+id/status': function(packet, client, params) {
    var path = 'output.' + params.id;
    var payload = JSON.parse(packet.payload.toString());
    var value = parseInt(payload.value);
    devices.update({ _id: client.id }, { $set: { [path]: { value: value } } });
  },
};

module.exports = server;
