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

function getValues(data, sensor, chunkSize) {
  const values = data
    .filter(item => item.sensor === sensor)
    .map(item => item.value);

  const chunks = values.reduce(chunker(chunkSize), []);

  return chunks
    .map(chunk => chunk.reduce(prev, curr) => prev + curr, 0) / chunk.length);
}

// function getTimestamp(data, chunkSize) {
//
// }

console.log(getValues(window.raw, 'LDR', 10));

// var ldrValues = window.raw
//   .filter(item => item.sensor === 'LDR')
//   .map(item => return item.value);
//
// var ldrChunkedValues = ldrValues.reduce(chunker(10), []);
//
// var labels = raw
//   .map(function(item) { return item.date })
//   .filter(function(item, position, self) { return self.indexOf(item) === position})
//   .map(function(item) { return moment.unix(item).format('HH:mm')});
//
// var ldrValues = raw
//   .filter(function(item) { return item.sensor === 'LDR' })
//   .map(function(item) { return item.value });
//
// var data = {
//   labels: labels,
//   datasets: [{ data: ldrValues }],
// };
//
// var ctx = document.getElementById("chart").getContext("2d");
// var chart = new Chart(ctx).Line(data, { responsive: true });
