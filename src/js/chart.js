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

getDataForTimestamp(data, begin, end) {
  const values = data
    .filter(d => d.date > begin)
    .filter(d => d.date < end);
    .map(d => d.value);

  return values.reduce((prev, curr) => prev + curr, 0) / values.length;
}
