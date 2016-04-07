var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', function (req, res) {
  console.log(req.body);
  res.send('OK');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
