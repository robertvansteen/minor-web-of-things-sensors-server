import mqtt from 'mqtt';
import env from './env';

var client  = mqtt.connect({ host: env.PUBSUB_HOST, port: env.PUBSUB_PORT });

client.on('connect', function () {
  console.log('Connected');
});

client.on('message', function (topic, message) {
  console.log(topic.toString(), message.toString());
});

export default client;
