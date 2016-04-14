var mosca = require('mosca')

var settings = {
  port: 1883
};

var server = new mosca.Server(settings);
server.on('ready', setup);

function setup() {
  console.log('Mosca server is up and running')
}

server.on('clientConnected', function(client) {
  console.log('client connected', client.id);
});

server.on('published', function(packet, client) {
  if(packet.topic === 'echo') {
    console.log('Published', packet.payload.toString('utf-8'));
    server.publish({
      topic: packet.topic,
      payload: packet.payload,
    });
  }
});
