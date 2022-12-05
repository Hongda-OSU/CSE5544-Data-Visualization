function drawPieChart(pieChart_data, margin, width, height, state) {
  var svg = d3
    .select("#pie_chart")
    .append("svg")
    .attr("width", width + margin.left * 2 + margin.right * 2)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left / 5 + "," + margin.top + ")");

  var producers = pieChart_data.columns.slice(1).map((d) => {
    return d;
  });
  var states = d3
    .map(pieChart_data, function (d) {
      return d.STATE;
    })
    .keys();

  var totalGenerationMapping = [];
  producers.forEach((producer, i) => {
    totalGenerationMapping[i] = {
      Producer: producer,
      Generation: d3.sum(
        pieChart_data.map(function (d) {
          return d[producer];
        })
      ),
    };
  });

  var stateMapping = (state) => {
    tempMapping = [];
    producers.forEach((producer, i) => {
      tempMapping[i] = {
        Producer: producer,
        Generation: d3.sum(
          pieChart_data.map(function (d) {
            return d.STATE == state && d[producer] != "" ? d[producer] : 0;
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
  var name = state == "" ? "United States" : state;

  var radius = Math.min(width, height) / 2.5;

  var color = d3
    .scaleOrdinal()
    .domain(producers)
    .range(["#3E79B2", "#F0872F", "#4D9E33", "#C6322E", "#906CBB"]);

  var pieGenerator = d3
    .pie()
    .value(function (d) {
      return d.value.Generation;
    })
    .sort(null);
  var arcData = pieGenerator(d3.entries(data));

  svg
    .selectAll("path")
    .data(arcData)
    .enter()
    .append("path")
    .attr("d", d3.arc().innerRadius(0).outerRadius(radius))
    .attr("fill", function (d) {
      return color(d.data.value.Producer);
    })
    .attr("transform", "translate(" + width / 3 + "," + height / 2 + ")")
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7);

  svg
    .append("text")
    .attr("class", "text")
    .attr("x", margin.left * 2)
    .attr("y", 5)
    .style("font-size", 18)
    .style("font-family", "sans-serif")
    .text("2021 " + name + " Electricity Generation by Different Producer");

  var sum = d3.sum(data, (d) => {
    return +d.Generation;
  });

  var formatter = d3.format(".2%");

  var legends = svg
    .selectAll(".legend")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
      return (
        "translate(" +
        width / 1.2 +
        "," +
        (i * 50 + margin.top * 2 + margin.bottom * 2) +
        ")"
      );
    });

  legends
    .append("circle")
    .attr("stroke-width", 2)
    .attr("fill", (d) => {
      return color(d.Producer);
    })
    .attr("r", 8);

  legends
    .append("text")
    .attr("x", 18)
    .attr("dy", ".35em")
    .style("font-size", 12)
    .text(function (d) {
      return d.Producer.split(",")[0] + ",";
    })
    .append("tspan")
    .attr("x", 15)
    .attr("dy", "1.3em")
    .style("font-size", 12)
    .text(function (d) {
      return d.Producer.split(",")[1] + " " + formatter(d.Generation / sum);
    });
}
