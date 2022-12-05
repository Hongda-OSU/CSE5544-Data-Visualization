function drawbarChart(barChart_data, margin, width, height, state) {
  var svg = d3
    .select("#bar_chart")
    .append("svg")
    .attr("width", width + margin.left * 2 + margin.right * 2)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr(
      "transform",
      "translate(" + margin.left * 1.5 + "," + margin.top + ")"
    );

  var months = d3
    .map(barChart_data, function (d) {
      return d.MONTH;
    })
    .keys();

  var states = d3
    .map(barChart_data, function (d) {
      return d.STATE;
    })
    .keys();

  var totalGenerationMapping = [];
  months.forEach((month, i) => {
    totalGenerationMapping[i] = {
      Month: month,
      Generation: d3.sum(
        barChart_data.map(function (d) {
          return d.MONTH == month ? d["GENERATION(Mwh)"] : 0;
        })
      ),
    };
  });

  var stateMapping = (state) => {
    tempMapping = [];
    months.forEach((month, i) => {
      tempMapping[i] = {
        Month: month,
        Generation: d3.sum(
          barChart_data.map(function (d) {
            return d.MONTH == month && d.STATE == state
              ? d["GENERATION(Mwh)"]
              : 0;
          })
        ),
      };
    });
    return tempMapping;
  };

  var stateGenerationMapping = [];
  states.forEach((state, i) => {
    stateGenerationMapping[i] = {
      State: state,
      Mapping: stateMapping(state),
    };
  });

  var data =
    state == ""
      ? totalGenerationMapping
      : stateGenerationMapping[states.indexOf(state)].Mapping;
  var min = state == "" ? 5e7 : 0;
  var max = d3.max(data, function (d) {
    return +d.Generation;
  });
  var name = state == "" ? "United States" : state;

  var x = d3.scaleBand().range([0, width]).domain(months).padding(0.4);
  var xAxis = d3.axisBottom(x);
  svg
    .append("g")
    .attr("transform", "translate(0" + "," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle");

  var y = d3
    .scaleLinear()
    .domain([min, max])
    .range([height, margin.top * 2]);
  var yAxis = d3.axisLeft(y);
  svg.append("g").call(yAxis);

  svg
    .selectAll(null)
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.Month);
    })
    .attr("y", function (d) {
      return y(d.Generation);
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return height - y(d.Generation);
    })
    .attr("fill", "#4781B4");

  var brush = svg.append("g").call(
    d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("brush", updateChart)
  );

  function updateChart() {
    extent = d3.event.selection;
    var x0 = extent[0][0],
      x1 = extent[1][0],
      y0 = extent[0][1],
      y1 = extent[1][1];

    selected = svg.selectAll("rect").filter(function (d) {
      return (
        x(d.Month) + x.bandwidth() >= x0 &&
        x(d.Month) <= x1 &&
        y(d.Generation) + height - y(d.Generation) >= y0 &&
        y(d.Generation) <= y1
      );
    });
    selected.attr("fill", "#F3A624");

    unselected = svg.selectAll("rect").filter(function (d) {
      return (
        !(
          x(d.Month) + x.bandwidth() >= x0 &&
          x(d.Month) <= x1 &&
          y(d.Generation) + height - y(d.Generation) >= y0 &&
          y(d.Generation) <= y1
        ) &&
        d.Month &&
        d.Generation
      );
    });

    unselected.attr("fill", "#4781B4");
  }

  svg
    .append("text")
    .attr("class", "text")
    .attr("x", margin.left)
    .attr("y", 10)
    .style("font-size", 18)
    .style("font-family", "sans-serif")
    .text("2021 " + name + " Monthly Electricity Generation");
}
