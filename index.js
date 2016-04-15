var moment = require('moment');
var assert = require('assert');
var Datastore = require('nedb');
var express = require('express');
var pubsub = require('./pubsub');
var bodyParser = require('body-parser');

// Load data
var data = require('./data');
var devices = require('./devices');

// Set up the server.
var app = express();

pubsub.attachHttpServer(app);

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('static'));

app.post('/', function (req, res) {
  console.log(req.body);

  var device = req.body.device;
  var value = req.body.value;
  var sensor = req.body.sensor;
  var date = Math.floor(Date.now() / 1000);

  data.insert({
    sensor: sensor,
    value: value,
    date: date,
    device: device,
  });

  res.send('OK');
});

app.get('/', function (req, res) {
  var now = moment().unix();
  var yesterday = moment().subtract(1, 'day').unix();

  data.find({ 'date': { $gte: yesterday } }).sort({'date': 1, 'sensor': 1}).exec(function(error, docs) {
    res.render('results', { data: docs, rawData: JSON.stringify(docs) });
  });
});

app.get('/raw', function (req, res) {
  var last = moment().subtract(4, 'hour').unix();

  data.find({ 'date': { $gte: last } }).sort({'date': 1, 'sensor': 1}).exec(function(error, docs) {
    res.render('raw', { data: docs, rawData: JSON.stringify(docs) });
  });
});

app.get('/dashboard', function (req, res) {
  devices.find({}, function(error, docs) {
    res.render('dashboard', { devices: docs });
  });
});

app.get('/device/:id', function (req, res) {
    devices.find({ _id: req.params.id }, function(error, docs) {
      res.render('device', { device: docs[0] });
    });
});

app.get('/lights/on', function (req, res) {
    pubsub.publish({
      topic: 'lights/1/state',
      payload: JSON.stringify({ value: 1 }),
    })
});

app.get('/lights/off', function (req, res) {
    pubsub.publish({
      topic: 'lights/1/state',
      payload: JSON.stringify({ value: 0 }),
    })
});

app.listen(3000, function () {
  console.log('Server listening on port 3000');
});
