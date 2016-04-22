(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * Curry method to chunk in combination with a reducer.
 *
 * @param  {Integer} size - The size of the array
 * @return {function}      Function to be passed in to a reducer.
 */
function chunker(size) {
  return function (prev, curr, index) {
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
  return set.reduce(function (prev, curr) {
    return prev + curr;
  }, 0) / set.length;
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
  var values = data.filter(function (item) {
    return item.sensor === sensor;
  }).map(function (item) {
    return parseInt(item.value);
  });

  var chunks = values.reduce(chunker(chunkSize), []);

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
  var values = data.filter(function (item) {
    return item.sensor === sensor;
  }).map(function (item) {
    return item.date;
  });

  var chunks = values.reduce(chunker(chunkSize), []);

  return chunks.map(function (chunk) {
    return chunk.reduce(function (prev, curr) {
      return prev + curr;
    }, 0) / chunk.length;
  }).map(function (item) {
    return moment.unix(item).format('HH:mm');
  });
}

var ctx = document.getElementById("chart").getContext("2d");
var gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(1, 'rgba(240,152,25, 0.4)');
gradient.addColorStop(0, 'rgba(255,81,47, 1)');

var ldrData = getValues(window.raw, 'LDR', 50).map(median).map(Math.round);

var motionData = getValues(window.raw, 'Motion', 50).map(function (chunk) {
  return chunk.filter(function (item) {
    return item > 0;
  });
}).map(function (chunk) {
  return chunk.length > 0 ? 1 : 0;
});

var data = {
  labels: getTimestamps(window.raw, 'LDR', 50),
  datasets: [{
    data: ldrData,
    fillColor: gradient,
    strokeColor: 'rgba(255,81,47, 1)',
    pointColor: 'rgba(255,81,47, 1)',
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)"
  }]
};

var chart = new Chart(ctx).Line(data, {
  responsive: true,
  scaleOverride: true,
  scaleSteps: 10,
  scaleStartValue: 0,
  scaleStepWidth: 100
});

},{}]},{},[1]);
