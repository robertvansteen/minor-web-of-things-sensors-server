var assert = require('assert');
var Datastore = require('nedb');
var express = require('express');
var bodyParser = require('body-parser');

// Set up the server.
var app = express();

// Set up the database.
var db = new Datastore({ filename: 'data.db', autoload: true });

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', function (req, res) {
  console.log(req.body);

  var device = req.body.device;
  var value = req.body.value;
  var sensor = req.body.sensor;
  var date = Math.floor(Date.now() / 1000);

  db.insert({
    sensor: sensor,
    value: value,
    date: date,
    device: device,
  });

  res.send('OK');
});

app.get('/', function (req, res) {
  db.find({}, function(error, docs) {
    res.render('results', { data: docs, rawData: JSON.stringify(docs) });
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
