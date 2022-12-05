function drawChoropleMap(choroplethMap_data, states, margin, width, height) {
  var svg = d3
    .select("#choropleth_map")
    .append("svg")
    .attr("width", width + margin.left * 2 + margin.right * 2)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left / 5 + "," + margin.top + ")");

  var generations = new Map();
  choroplethMap_data.map((d) => {
    generations.set(d.STATE, d.GENERATION);
  });

  var [min, max] = [
    d3.min(choroplethMap_data, function (d) {
      return +d.GENERATION;
    }),
    d3.max(choroplethMap_data, function (d) {
      return +d.GENERATION;
    }),
  ];

  var projection = d3.geoAlbersUsa().fitExtent(
    [
      [0, 0],
      [width, height],
    ],
    states
  );
  var geoGenerator = d3.geoPath().projection(projection);
  var color = d3
    .scaleSequential()
    .domain([0, 5e8])
    .interpolator(d3.interpolateBlues);

  let mouseOver = function (d) {
    d3.selectAll(".state").style("opacity", 0.7);
    d3.select(this).style("opacity", 1);
  };

  let mouseLeave = function (d) {
    d3.selectAll(".state").style("opacity", 1);
    d3.select(this).style("opacity", 1);
  };

  var paths = svg
    .selectAll("path")
    .data(states.features)
    .enter()
    .append("path")
    .attr("d", geoGenerator)
    .attr("class", "state")
    .style("stroke", "#b3b3cc")
    .style("stroke-width", "1")
    .style("opacity", 1)
    .style("fill", function (d) {
      return color(generations.get(d.properties.name));
    })
    .on("mouseover", mouseOver)
    .on("mouseleave", mouseLeave);

  var legend = svg.append("g").attr("class", "legend");

  var lg = legend
    .append("linearGradient")
    .attr("id", "choroplethMap_gradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");

  var segmentations = 10;
  for (var i = 0; i <= segmentations; i++) {
    lg.append("stop")
      .attr("offset", ((100 * i) / segmentations).toString() + "%")
      .attr("stop-color", color((5e8 * (segmentations - i)) / segmentations));
  }

  legend
    .append("rect")
    .attr("width", margin.left / 6 + margin.right / 6)
    .attr("height", height - margin.top * 4 - margin.bottom * 4)
    .attr(
      "transform",
      "translate(" +
        (width + margin.left / 3) +
        "," +
        (margin.top * 2 + margin.bottom * 2) +
        ")"
    )
    .style("fill", "url(#choroplethMap_gradient)");

  var y = d3
    .scaleLinear()
    .domain([0, 5e8])
    .range([height - margin.top * 4, margin.bottom * 4]);
  var yAxis = d3.axisRight(y).ticks(10);

  legend
    .append("g")
    .attr("class", "y_coordinate")
    .attr("transform", "translate(" + (width + margin.left / 1.5) + ", 0)")
    .call(yAxis);

  legend
    .append("text")
    .attr("class", "text")
    .attr("x", width / 2 - margin.left * 3)
    .attr("y", margin.top * 3)
    .style("font-size", 24)
    .style("font-family", "sans-serif")
    .text("2021 Electricity Generation on Map");
}
