d3.csv("toughestsport.csv").then(data => {
    data.forEach(d => {
        d.END = +d.END;
        d.STR = +d.STR;
        d.PWR = +d.PWR;
        d.SPD = +d.SPD;
        d.AGI = +d.AGI;
        d.FLX = +d.FLX;
        d.NER = +d.NER;
        d.DUR = +d.DUR;
        d.HAN = +d.HAN;
        d.ANA = +d.ANA;
        d.TOTAL = +d.TOTAL;
        d.RANK = +d.RANK;
    });

    let topSports = data.sort((a, b) => a.RANK - b.RANK).slice(0, 20);

    const margin = {top: 20, right: 30, bottom: 70, left: 90},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Setup for the ranking chart
    const rankSvg = d3.select("#rank-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xRank = d3.scaleLinear()
        .domain([0, d3.max(topSports, d => d.TOTAL)])
        .range([0, width]);

    const yRank = d3.scaleBand()
        .domain(topSports.map(d => d.SPORT))
        .range([0, height])
        .padding(0.1);

    rankSvg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xRank));

    rankSvg.append("g")
        .call(d3.axisLeft(yRank));

    rankSvg.selectAll(".rank-bar")
        .data(topSports)
        .enter().append("rect")
        .attr("class", "rank-bar")
        .attr("x", 0)
        .attr("y", d => yRank(d.SPORT))
        .attr("width", d => xRank(d.TOTAL))
        .attr("height", yRank.bandwidth())
        .attr("fill", "steelblue");

    rankSvg.selectAll(".rank-label")
        .data(topSports)
        .enter().append("text")
        .attr("class", "rank-label")
        .attr("x", d => xRank(d.TOTAL) + 3)
        .attr("y", d => yRank(d.SPORT) + yRank.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => d.TOTAL);

    // Dropdown menu for all sports
    let dropDown = d3.select("#dropdown").append("select")
        .attr("name", "sports");

    dropDown.selectAll("option")
        .data(data)
        .enter().append("option")
        .text(d => d.SPORT)
        .attr("value", d => d.SPORT);

    // SVG setup for bar chart
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(['END', 'STR', 'PWR', 'SPD', 'AGI', 'FLX', 'NER', 'DUR', 'HAN', 'ANA'])
        .range([0, height])
        .padding(0.1);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Update chart function
    function updateChart(sportName) {
        let sportData = data.find(d => d.SPORT === sportName);
        let attributes = ['END', 'STR', 'PWR', 'SPD', 'AGI', 'FLX', 'NER', 'DUR', 'HAN', 'ANA'];
        let values = attributes.map(a => ({attribute: a, value: sportData[a]}));

        x.domain([0, d3.max(values, d => d.value)]);
        y.domain(attributes);

        const bars = svg.selectAll(".bar")
            .data(values, d => d.attribute);

        bars.enter().append("rect")
            .attr("class", "bar")
            .merge(bars)
            .attr("x", 0)
            .attr("y", d => y(d.attribute))
            .attr("width", d => x(d.value))
            .attr("height", y.bandwidth())
            .attr("fill", d => colorScale(d.attribute));

        bars.exit().remove();

        const labels = svg.selectAll(".label")
            .data(values, d => d.attribute);

        labels.enter().append("text")
            .attr("class", "label")
            .merge(labels)
            .attr("x", d => x(d.value) + 3)
            .attr("y", d => y(d.attribute) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .text(d => d.value);

        labels.exit().remove();
    }

    updateChart(topSports[0].SPORT);

    dropDown.on("change", function() {
        updateChart(this.value);
    });
});
