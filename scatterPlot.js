var margin = {top: 10, right: 30, bottom: 40, left: 60},
    width = 690 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
var SVG = d3.select("#dataviz_axisZoom")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read the data
d3.csv("clean_nhl_data.csv").then(function(data) {

    // Initialize axes with default selections
    var xKey = "goals";
    var yKey = "assists";

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return +d[xKey]; }))
        .range([ 0, width ]);
    var xAxis = SVG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return +d[yKey]; }))
        .range([ height, 0]);
    var yAxis = SVG.append("g")
        .call(d3.axisLeft(y));

    SVG.append("text")
        .attr("id", "x-axis-label")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 20)
        .text("Goals");

    SVG.append("text")
        .attr("id", "y-axis-label")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top - height / 2 + 20)
        .text("Assists");

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = SVG.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("SVG:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    // Create the scatter variable: where both the circles and the brush take place
    var scatter = SVG.append('g')
        .attr("clip-path", "url(#clip)");

    // Add circles
    scatter.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(+d[xKey]); } )
        .attr("cy", function (d) { return y(+d[yKey]); } )
        .attr("r", 8)
        .style("fill", "#61a3a9")
        .style("opacity", 0.5);

    SVG.selectAll(".player-label")
        .data(data)
        .enter().append("text")
        .attr("class", "player-label")
        .attr("x", function(d) { return x(+d[xKey]) + 10; })  // Adjust position to the right of the circle
        .attr("y", function(d) { return y(+d[yKey]) + 5; })   // Adjust position slightly below the circle
        .text(function(d) { return d.player; });

    // Set the zoom and pan features: how much you can zoom, on which part, and what to do when there is a zoom
    var zoom = d3.zoom()
        .scaleExtent([.5, 20])  // This controls how much you can unzoom (x0.5) and zoom (x20)
        .extent([[0, 0], [width, height]])
        .on("zoom", updateChart);

    // This adds an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zooms
    SVG.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom);

    // Function to update the chart when the user zooms and thus new boundaries are available
    function updateChart(event) {
        // Recover the new scale
        var newX = event.transform.rescaleX(x);
        var newY = event.transform.rescaleY(y);

        // Update axes with these new boundaries
        xAxis.call(d3.axisBottom(newX));
        yAxis.call(d3.axisLeft(newY));

        // Update circle positions
        scatter.selectAll("circle")
            .attr('cx', function(d) { return newX(+d[xKey]); })
            .attr('cy', function(d) { return newY(+d[yKey]); });
        
        SVG.selectAll(".player-label")
            .attr("x", function(d) { return newX(+d[xKey]) + 10; })
            .attr("y", function(d) { return newY(+d[yKey]) + 5; });
    }

    // Function to update the axes based on the selected dropdown values
    function updateAxes() {
        xKey = d3.select("#x-axis").property("value");
        yKey = d3.select("#y-axis").property("value");

        x.domain(d3.extent(data, function(d) { return +d[xKey]; }));
        y.domain(d3.extent(data, function(d) { return +d[yKey]; }));

        xAxis.transition().duration(1000).call(d3.axisBottom(x));
        yAxis.transition().duration(1000).call(d3.axisLeft(y));

        scatter.selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function(d) { return x(+d[xKey]); })
            .attr("cy", function(d) { return y(+d[yKey]); });
        
        SVG.selectAll(".player-label")
            .transition().duration(1000)
            .attr("x", function(d) { return x(+d[xKey]) + 10; })
            .attr("y", function(d) { return y(+d[yKey]) + 5; });
        
        SVG.select("#x-axis-label").text(xKey);
        SVG.select("#y-axis-label").text(yKey);
    }

    // Add event listeners to the dropdown menus
    d3.select("#x-axis").on("change", updateAxes);
    d3.select("#y-axis").on("change", updateAxes);
});