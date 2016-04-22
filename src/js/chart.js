/**
 * Curry method to chunk in combination with a reducer.
 *
 * @param  {Integer} size - The size of the array
 * @return {function}      Function to be passed in to a reducer.
 */
function chunker(size) {
  return function(prev, curr, index) {
    var id = index / size | 0;
    (prev[id] = prev[id] || []).push(curr);
    return prev;
  };
}

/**
 * Get the avarage of an array.
 *
 * @param  {Array} set
 * @return {Integer}
 */
function median(set) {
  return set.reduce((prev, curr) => prev + curr, 0) / set.length;
}

/**
 * Get the values for the provided data & sensor in chunks.
 *
 * @param  {Array} data
 * @param  {String} sensor
 * @param  {Integer} chunkSize
 *
 * @return {Array}
 */
function getValues(data, sensor, chunkSize) {
  const values = data
    .filter(item => item.sensor === sensor)
    .map(item => parseInt(item.value));

  const chunks = values.reduce(chunker(chunkSize), []);

  return chunks;
}

/**
 * Get the timestamps for the provided data & sensor in chunks.
 *
 * @param  {Array} data
 * @param  {String} sensor
 * @param  {Integer} chunkSize
 *
 * @return {Array}
 */
function getTimestamps(data, sensor, chunkSize) {
  const values = data
    .filter(item => item.sensor === sensor)
    .map(item => item.date);

  const chunks = values.reduce(chunker(chunkSize), []);

  return chunks
    .map(chunk => chunk.reduce((prev, curr) => prev + curr, 0) / chunk.length)
    .map(item => moment.unix(item).format('HH:mm'));
}

function init() {
  var el = document.getElementById("chart");
  if(!el) return false;

  var ctx = document.getElementById("chart").getContext("2d");
  var gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(1, 'rgba(240,152,25, 0.4)');
  gradient.addColorStop(0, 'rgba(255,81,47, 1)');

  var ldrData = getValues(window.data, 'ldr', 50)
    .map(median)
    .map(Math.round);

  var motionData = getValues(window.data, 'Motion', 50)
    .map(chunk => chunk.filter(item => item > 0))
    .map(chunk => chunk.length > 0 ? 1 : 0);

  var data = {
    labels: getTimestamps(window.data, 'ldr', 50),
    datasets: [
      {
        data: ldrData,
        fillColor: gradient,
        strokeColor: 'rgba(255,81,47, 1)',
        pointColor: 'rgba(255,81,47, 1)',
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
      },
    ],
  };

  var chart = new Chart(ctx).Line(data, {
    responsive: true,
    scaleOverride:true,
    scaleSteps: 10,
    scaleStartValue:0,
    scaleStepWidth: 100,
  });
}

export default init;
