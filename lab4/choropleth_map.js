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

  var Tooltip = d3
    .select("#choropleth_map")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  var zoom = d3
    .zoom()
    .scaleExtent([1, 5])
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", (event) => {
      map.selectAll("path").attr("transform", d3.event.transform);
    });

  var mouseOver = function (d) {
    Tooltip.style("opacity", 1);
    d3.selectAll(".state").style("opacity", 0.7);
    d3.select(this).style("opacity", 1);
  };

  var mouseMove = function (d) {
    Tooltip.html(
      d.properties.name +
        "<br>Generation: " +
        generations.get(d.properties.name)
    )
      .style("left", d3.event.pageX + 50 + "px")
      .style("top", d3.event.pageY + "px");
  };

  var mouseLeave = function (d) {
    Tooltip.style("opacity", 0);
    d3.selectAll(".state").style("opacity", 1);
    d3.select(this).style("opacity", 1);
    // zoom back
    // map.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
  };

  var map = svg.append("g").attr("class", "map");
  map
    .selectAll(null)
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
    .on("mousemove", mouseMove)
    .on("mouseleave", mouseLeave)
    .on("click", function (d) {
      updatePage(d.properties.name)
      d3.select(this).style("stroke", "red");
    });

  map.call(zoom);

  var legend = svg.append("g").attr("class", "legend");

  var gradient = legend
    .append("linearGradient")
    .attr("id", "choroplethMap_gradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");

  var segmentations = 10;
  for (var i = 0; i <= segmentations; i++) {
    gradient
      .append("stop")
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
    .attr("class", "y_Axis")
    .attr("transform", "translate(" + (width + margin.left / 1.5) + ", 0)")
    .call(yAxis);

  legend
    .append("text")
    .attr("class", "text")
    .attr("x", width / 2 - margin.left * 1.5)
    .attr("y", margin.top * 2)
    .style("font-size", 18)
    .style("font-family", "sans-serif")
    .text("2021 Electricity Generation on Map");
}
