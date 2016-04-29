var env = require('./env');
var mosca = require('mosca');
var moment = require('moment');
var Datastore = require('nedb');
var request = require('request');

var data = require('./data');
var devices = require('./devices');
var disturbance = require('./disturbance');
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

    checkDisturbance(client.id);
    data.insert({ sensor: params.sensor, value: payload.value, date: moment().unix(), device: client.id });
  },

  '+device/output/+id/status': function(packet, client, params) {
    var path = 'output.' + params.id;
    var payload = JSON.parse(packet.payload.toString());
    var value = parseInt(payload.value);
    devices.update({ _id: client.id }, { $set: { [path]: { value: value } } });
  },
};

function checkDisturbance(deviceId) {
  var now = moment().unix();
  var measureTreshold = moment().subtract(1, 'minutes').unix();
  var reportTreshold = moment().subtract(30, 'minutes').unix();

  data.find({ device: deviceId, date: { $gt: measureTreshold } }, function(err, docs) {
    var average = docs
      .map(doc => doc.value)
      .reduce((prev, curr) => prev + curr, 0) / docs.length;

    if(average < 75) {
      return false;
    }

    var lastReport = disturbance.findOne({ device: deviceId }).sort({ date: -1 }).exec(function(err, doc) {
      if (!doc || doc.date < reportTreshold) {
        devices.findOne({ _id: deviceId }, function(err, device) {
          server.publish({ topic: deviceId + '/report', payload: { device: deviceId, date: moment().unix() } });
          disturbance.insert({ device: deviceId, date: moment().unix() });
          request
            .post('https://maker.ifttt.com/trigger/report/with/key/cTNM3M3pc7hZo91wRC8nxI')
            .form({ value1: device.label });
        });
      }
    });
  });
}

module.exports = server;
