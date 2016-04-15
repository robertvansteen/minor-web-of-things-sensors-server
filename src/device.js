import pubsub from './pubsub';

let light = null;

pubsub.subscribe('lights/1/status');

pubsub.on('message', function(topic, message) {
  if(topic !== 'lights/1/status') return false;
  if(!light) return false;

  const value = !! JSON.parse(message.toString()).value;
  light.bootstrapSwitch('state', value);
});

export default function() {
  light = $('.js-checkbox').bootstrapSwitch();
  light.on('switchChange.bootstrapSwitch', function(event, state) {
    const value = (state) ? 1 : 0;
    pubsub.publish('lights/1/state', JSON.stringify({ value: value }));
  });
}
