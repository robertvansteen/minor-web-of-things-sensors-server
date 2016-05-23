import pubsub from './pubsub';

const device = window.device;

device.output.map(output => pubsub.subscribe(`${device._id}/output/${output.id}`));

pubsub.on('message', function(topic, message) {
  const fragments = topic.split('/');
  const id = fragments[fragments.length - 1];

  window.device.output.find(output => output.id === id);
});

let onColorChange = _.debounce(event => {
  const topic = event.target.getAttribute('data-topic');
  const color = event.color.toRGB();
  pubsub.publish(topic, JSON.stringify({ r: color.r, g: color.g, b: color.b }));
}, 1000);

export default function() {
  var light = $('.js-checkbox').bootstrapSwitch();
  light.on('switchChange.bootstrapSwitch', function(event, state) {
    const value = (state) ? 0 : 1;
    const topic = event.target.getAttribute('data-topic');
    pubsub.publish(topic, JSON.stringify({ disabled: value }));
  });

  $('.button').click(function() {
    const topic = event.target.getAttribute('data-topic');
    pubsub.publish(topic);
  });

  $('.strip').colorpicker()
    .on('changeColor', onColorChange);
}
