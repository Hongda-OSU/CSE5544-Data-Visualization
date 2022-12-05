function drawHeatMap(heatMap_data, margin, width, height) {
  var svg = d3
    .select("#heat_map")
    .append("svg")
    .attr("width", width + margin.left * 2 + margin.right * 2)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var months = d3
    .map(heatMap_data, function (d) {
      return d.MONTH;
    })
    .keys();
  var states = d3
    .map(heatMap_data, function (d) {
      return d.STATE;
    })
    .keys();

  var x = d3.scaleBand().range([0, width]).domain(months).padding(0.05);
  var xAxis = d3.axisBottom(x).tickSize(0);
  svg
    .append("g")
    .style("font-size", 15)
    .style("font-family", "sans-serif")
    .attr("transform", "translate(0," + (height - margin.top * 5) + ")")
    .call(xAxis)
    .select(".domain")
    .remove();

  var y = d3
    .scaleBand()
    .range([height - margin.top * 15, 0])
    .domain(states)
    .padding(0.05);
  var yAxis = d3.axisLeft(y).tickSize(0);
  svg
    .append("g")
    .style("font-size", 15)
    .style("font-family", "sans-serif")
    .attr(
      "transform",
      "translate(" + -margin.left / 5 + "," + margin.top * 10 + ")"
    )
    .call(yAxis)
    .select(".domain")
    .remove();

  var color = d3
    .scaleSequential()
    .domain([1.8e7, 4e6])
    .interpolator(d3.interpolateRdBu);

  svg
    .selectAll()
    .data(heatMap_data, function (d) {
      return d.MONTH + ":" + d.STATE;
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.MONTH);
    })
    .attr("y", function (d) {
      return y(d.STATE);
    })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", function (d) {
      return color(d.GENERATION);
    })
    .attr("transform", "translate(0," + margin.top * 10 + ")")
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8);

  var legend = svg.append("g").attr("class", "legend");

  var lg = legend
    .append("linearGradient")
    .attr("id", "heatMap_gradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");

  var segmentations = 15;
  for (var i = 0; i <= segmentations; i++) {
    lg.append("stop")
      .attr("offset", ((100 * i) / segmentations).toString() + "%")
      .attr("stop-color", color((1.8e7 * (segmentations - i)) / segmentations));
  }

  legend
    .append("rect")
    .attr("width", margin.left / 5 + margin.right / 5)
    .attr("height", height - margin.top * 14.95)
    .attr(
      "transform",
      "translate(" + (width + margin.left / 3) + "," + margin.top * 10 + ")"
    )
    .style("fill", "url(#heatMap_gradient)");

  var y = d3
    .scaleLinear()
    .domain([4.1e6, 1.8e7])
    .range([height - margin.top * 15, 0]);
  var yAxis = d3.axisRight(y).ticks(15);

  legend
    .append("g")
    .attr("class", "y_coordinate")
    .attr(
      "transform",
      "translate(" + (width + margin.left / 1.39) + ", " + margin.top * 10 + ")"
    )
    .call(yAxis);

  legend
    .append("text")
    .attr("class", "text")
    .attr("x", width / 2 - margin.left * 4.5)
    .attr("y", margin.top * 8)
    .style("font-size", 24)
    .style("font-family", "sans-serif")
    .text("2021 Monthly Electricity Generation HeatMap");
}
