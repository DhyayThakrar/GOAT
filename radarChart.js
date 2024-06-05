// radarChart.js

function RadarChart(id, data, options) {
    var cfg = {
        w: 600,
        h: 600,
        margin: {top: 100, right: 600, bottom: 100, left: 150},
        levels: 5,
        maxValue: 0,
        labelFactor: 1.25,
        wrapWidth: 60,
        opacityArea: 0.35,
        dotRadius: 4,
        opacityCircles: 0.1,
        strokeWidth: 2,
        roundStrokes: false,
        color: d3.scaleOrdinal(d3.schemeCategory10)
    };

    if ('undefined' !== typeof options) {
        for (var i in options) {
            if ('undefined' !== typeof options[i]) {
                cfg[i] = options[i];
            }
        }
    }

    cfg.maxValue = Math.max(cfg.maxValue, d3.max(data, function(i) { return d3.max(i.attributes.map(function(o) { return o.value; })); }));

    var allAxis = data[0].attributes.map(function(i) { return i.axis; }),
        total = allAxis.length,
        radius = Math.min(cfg.w / 2, cfg.h / 2),
        angleSlice = Math.PI * 2 / total;

    var rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, cfg.maxValue]);

    var svg = d3.select(id).append("svg")
        .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
        .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

    var axisGrid = svg.append("g").attr("class", "axisWrapper");

    axisGrid.selectAll(".levels")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", function(d) { return radius / cfg.levels * d; })
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", cfg.opacityCircles)
        .style("filter", "url(#glow)");

    var axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");
    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function(d, i) { return rScale(cfg.maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI/2); })
        .attr("y2", function(d, i) { return rScale(cfg.maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI/2); })
        .attr("class", "line")
        .style("stroke", "white")
        .style("stroke-width", "2px");

    axis.append("text")
        .attr("class", "legend")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function(d, i) { return rScale(cfg.maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI/2); })
        .attr("y", function(d, i) { return rScale(cfg.maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI/2); })
        .text(function(d) { return d; });

    var radarLine = d3.radialLine()
        .curve(d3.curveLinearClosed)
        .radius(function(d) { return rScale(d.value); })
        .angle(function(d, i) { return i * angleSlice; });

    if (cfg.roundStrokes) {
        radarLine.curve(d3.curveCardinalClosed);
    }

    var radarWrapper = svg.selectAll(".radarWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarWrapper");

    radarWrapper.append("path")
        .attr("class", "radarArea")
        .attr("d", function(d) { return radarLine(d.attributes); })
        .style("fill", function(d, i) { return cfg.color(i); })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function(event, d) {
            // Update tooltip style and position
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(d.name) // Display the sport's name
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", 0.1);
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);
        })
        .on('mouseout', function() {
            d3.select("#tooltip").style("opacity", 0); // Hide tooltip on mouseout
            d3.selectAll(".radarArea")
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);
        });

    radarWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", function(d) { return radarLine(d.attributes); })
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function(d, i) { return cfg.color(i); })
        .style("fill", "none")
        .style("filter", "url(#glow)");

        // Create a legend wrapper
// Create a legend wrapper positioned more explicitly
var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (cfg.w - 150) + "," + 200 + ")");

// Add legend squares
legend.selectAll(".legend-rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function(d, i) { return i * 20; })
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function(d, i) { return cfg.color(i); });

// Add legend text
legend.selectAll(".legend-text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", 20)
    .attr("y", function(d, i) { return i * 20 + 9; })
    .text(function(d) { return d.name; })
    .attr("font-size", "11px")
    .attr("fill", "#737373");



}

d3.csv("toughestsport.csv").then(function(data) {
    var sportsData = data.filter(function(d, i) { return i < 5; }).map(function(d) {
        return {
            name: d.SPORT,
            attributes: [
                {axis: "Endurance", value: +d.END},
                {axis: "Strength", value: +d.STR},
                {axis: "Power", value: +d.PWR},
                {axis: "Speed", value: +d.SPD},
                {axis: "Agility", value: +d.AGI},
                {axis: "Flexibility", value: +d.FLX},
                {axis: "Nerve", value: +d.NER},
                {axis: "Durability", value: +d.DUR},
                {axis: "Hand-Eye Coordination", value: +d.HAN},
                {axis: "Analytical Aptitude", value: +d.ANA}
            ]
        };
    });

    var mycfg = {
        w: 500,
        h: 500,
        maxValue: 10,
        levels: 10,
        wrapWidth: 60,
        color: d3.scaleOrdinal(d3.schemeCategory10)
    };

    RadarChart("#radarChart", sportsData, mycfg);
});
