const states_path = "src_data/us-states.json";
const choroplethMap_path = "processed_data/ChoroplethMapData.csv";
const heatMap_path = "processed_data/HeatMapData.csv";
const treeMap_path = "processed_data/TreeMapData.json";

var margin = { top: 20, right: 50, bottom: 20, left: 50 },
  width = 800 - margin.left - margin.right,
  height = 650 - margin.top - margin.bottom;

// There are two ways in d3 to deal with asynchronous behavior in D3
// d3.queue
d3.queue()
  .defer(d3.csv, choroplethMap_path)
  .defer(d3.json, states_path)
  .await(data_load);

function data_load(error, choroplethMap_data, states) {
  if (error) throw error;
  drawChoropleMap(choroplethMap_data, states, margin, width, height);
}

// callback function for d3 data loding function
d3.csv(heatMap_path, function (error, heatMap_data) {
  if (error) throw error;
  drawHeatMap(heatMap_data, margin, width, height);
});

d3.json(treeMap_path, function (error, treeMap_data) {
  if (error) throw error;
  drawTreeMap(treeMap_data, margin, width, height);
});

// var data = [];
// d3.csv(choroplethMap_path, function(d) {
//     data = d;
//     console.log(data);
// })
// console.log(data)
