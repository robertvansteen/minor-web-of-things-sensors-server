var mqtt = require('mqtt');
var client  = mqtt.connect({ host: '172.20.10.2', port: 1883 });

client.on('connect', function () {
  client.subscribe('presence');
  client.publish('presence', 'Hello mqtt');
});

client.on('message', function (topic, message) {
  console.log(topic.toString(), message.toString());
});

client.subscribe('echo');

console.log('test');
