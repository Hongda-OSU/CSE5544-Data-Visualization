function drawTreeMap(treeMap_data, margin, width, height) {
  var svg = d3
    .select("#tree_map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var root = d3.hierarchy(treeMap_data).sum(function (d) {
    return d.value;
  });

  d3
    .treemap()
    .size([width, height])
    .paddingTop(40)
    .paddingRight(7)
    .paddingInner(3)(root);

  var color = d3
    .scaleOrdinal()
    .domain(["Midwest", "Northeast", "South", "West"])
    .range(["#6593C1", "#F39A50", "#70B15C", "#D25B58"]);

  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return d.x0;
    })
    .attr("y", function (d) {
      return d.y0;
    })
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .style("stroke", "black")
    .style("fill", function (d) {
      return color(d.parent.data.name);
    });

  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", function (d) {
      return (d.x0 + d.x1) / 2;
    })
    .attr("y", function (d) {
      if (d.data.name == "DC") {
        return (d.y0 + d.y1) / 2 - margin.top / 5;
      }
      return (d.y0 + d.y1) / 2 + margin.top / 4;
    })
    .text(function (d) {
      return d.data.name;
    })
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-family", "sans-serif")
    .style("font-weight", "bold")
    .attr("fill", "black");

  svg
    .selectAll("titles")
    .data(
      root.descendants().filter(function (d) {
        return d.depth == 1;
      })
    )
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0;
    })
    .attr("y", function (d) {
      return d.y0 + 35;
    })
    .text(function (d) {
      return d.data.name;
    })
    .style("font-size", "21px")
    .style("font-family", "sans-serif")
    .attr("fill", function (d) {
      return color(d.data.name);
    });

  svg
    .append("text")
    .attr("class", "text")
    .attr("x", width / 2 - margin.left * 4)
    .attr("y", margin.top)
    .style("font-size", "24px")
    .style("font-family", "sans-serif")
    .text("2021 Electricity Generation TreeMap");
}
