import pubsub from './pubsub';

const device = window.device;

device.output.map(output => pubsub.subscribe(`${device._id}/output/${output.id}`));

pubsub.on('message', function(topic, message) {
  const fragments = topic.split('/');
  const id = fragments[fragments.length - 1];
  const value = !! JSON.parse(message.toString()).value;
  $(`[data-output-id=${id}]`).bootstrapSwitch('state', value);
});

// let onColorChange = _.debounce(event => {
//   console.log('Changing color');
//   const color = event.color.toRGB();
//   pubsub.publish('lights/1/state', JSON.stringify({ r: color.r, g: color.g, b: color.b }));
// }, 1000);

export default function() {
  var light = $('.js-checkbox').bootstrapSwitch();
  light.on('switchChange.bootstrapSwitch', function(event, state) {
    const value = (state) ? 1 : 0;
    const topic = event.target.getAttribute('data-topic');
    pubsub.publish(topic, JSON.stringify({ value: value }));
  });

  $('.button').click(function() {
    const topic = event.target.getAttribute('data-topic');
    pubsub.publish(topic);
  });

  // $('#strip').colorpicker()
  //   .on('changeColor', onColorChange);
}
