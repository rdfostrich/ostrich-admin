plotArray(vm, '#stats-versions');

function plotArray(data, target) {
  var margin = { top: 20, right: 20, bottom: 30, left: 50 },
      width = 600,
      height = 300;

  var x = d3.scaleLinear()
    .range([0, width]);

  var y = d3.scaleLinear()
    .range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  var svg = d3.select(target).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(d3.extent([0].concat(data), function(d, i) { return i; }));
  y.domain(d3.extent([0].concat(data), function(d) { return d; }));

  // X axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Y axis
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Triples");

  // Bar rectangles
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d, i) { return x(i); })
    .attr("width", width / (data.length)  )
    .attr("y", function(d) { return y(d); })
    .attr("height", function(d) { return height - y(d); })
    .on("mouseover", function(d, i) {
      d3.select("#graphtooltip")
        .select("#version")
        .text(" " + i);
      d3.select("#graphtooltip")
        .select("#value")
        .text(" " + d);
      d3.select("#graphtooltip").classed("hide", false);
    })
    .on("mouseout", function() {
      d3.select("#graphtooltip").classed("hide", true);
    })
    .append("div")
    .text(function(d) { return "<span>Triples:</span> " + d; });

  svg.append("path")
    .datum(data)
}
