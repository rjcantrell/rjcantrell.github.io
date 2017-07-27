!function() {

var retVal = { };

var measure = "Measure";
var year = "Year";
var value = "Value";
var avg = "avg";			//lame, I know.
var min = "min";			//But I boilerplated this hour-one while I thought about the project
var max = "max";			//not knowing if I was going to change my input file.

var maxcolor = this.common.colors.danger;
var mincolor = this.common.colors.success;
var avgcolor = this.common.colors.warning;

function initialize(svg_container_id, width, height) {

	d3.csv("/shotpct_team_by_year_summary.csv", function (error, data) {
		if (error) { throw error; }
		update(data, svg_container_id, width, height);
	});
}

function update(data, svg_container_id, width, height)
{
	//separate avg, min, and max series for separate plotting
	var maxes = data.filter(function(row) { return row[measure] == max });
	var mins = data.filter(function(row) { return row[measure] == min });
	var avgs = data.filter(function(row) { return row[measure] == avg });

	//create scales used to display line-chart points
	var xScale = d3.scaleLinear()
						 .domain([d3.min(data, function(d) { return +d[year]; }),
								  d3.max(data, function(d) { return +d[year]; })])
						 .range([common.margin.left, width - (common.margin.left + common.margin.right)])

		var yScale = d3.scaleLinear()
						 .domain([d3.min(data, function(d) { return +d[value]; }),
								  d3.max(data, function(d) { return +d[value]; })])
						 .range([height, common.margin.top]) //SVG coords are backwards

	//line-maker function
	var lineGen = common.lineGen.bind(this, xScale, yScale, year, value)();

	//create SVG elements
	var svg = d3.select("div#" + svg_container_id)
					.append("svg")
					.attr("width", width + common.margin.left + common.margin.right)
					.attr("height", height + common.margin.top + common.margin.bottom);

	//max line
	svg.append("svg:path")
		   .attr("d", lineGen(maxes))
		   .attr("stroke", maxcolor)
		   .attr("stroke-width", 2)
		   .attr("fill", "none");

	//min line
	svg.append("svg:path")
		   .attr("d", lineGen(mins))
		   .attr("stroke", mincolor)
		   .attr("stroke-width", 2)
		   .attr("fill", "none");

	//avg line
	svg.append("svg:path")
		   .attr("d", lineGen(avgs))
		   .attr("stroke", avgcolor)
		   .attr("stroke-width", 2)
		   .attr("fill", "none");

	//max datapoints
	svg.selectAll("." + max)
		   .data(maxes)
		   .enter()
		   .append("circle")
		   .merge(svg)
		   .attr("class", max)
		   .attr("cx", function(d) { return xScale(d[year]); })
		   .attr("cy", function(d) { return yScale(d[value]); })
		   .attr("fill", maxcolor)
		   .attr("r","5");

	//min datapoints
	svg.selectAll("." + min)
		   .data(mins)
		   .enter()
		   .append("circle")
		   .merge(svg)
		   .attr("class", min)
		   .attr("cx", function(d) { return xScale(d[year]); })
		   .attr("cy", function(d) { return yScale(d[value]); })
		   .attr("fill", mincolor)
		   .attr("r","5");

	//avg datapoints
	svg.selectAll("." + avg)
		   .data(avgs)
		   .enter()
		   .append("circle")
		   .merge(svg)
		   .attr("class", avg)
		   .attr("cx", function(d) { return xScale(d[year]); })
		   .attr("cy", function(d) { return yScale(d[value]); })
		   .attr("fill", avgcolor)
		   .attr("r","5");

	//draw axes
	var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0f"));
	var yAxis = d3.axisLeft(yScale);

	//label axes
	svg.append("text")
		.attr("class", "y label")
	    .attr("text-anchor", "end")
		.attr("fill", common.colors.major_axes)
	    .attr("y", 10)
		.attr("x", (height / 2) * -1)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)")
	    .text("Shot Percentage: Goals / Shots Attempted");

	axes = svg.append("g").attr("class", "axes");

	//show X axis
	var xAxisGroup = axes.append("g").attr("class", "x-axis");
	var boundCustomXAxis = common.customXAxis.bind(null, xAxisGroup, xAxis);
	xAxisGroup.attr("transform", "translate(0," + height + ")")
    			.call(boundCustomXAxis);

	//show Y axis
	var yAxisGroup = axes.append("g").attr("class","y-axis");
	var boundCustomYAxis = common.customYAxis.bind(null, yAxisGroup, yAxis, width);
	yAxisGroup.attr("transform", "translate(" + common.margin.left + ",0)")
				.call(boundCustomYAxis);

	//tooltips
	var tooltip = common.tooltip();

	//TODO: trim d[value] to X decimal places
	svg.selectAll("circle")
		.on("mouseover", function(d) {
			d3.select(this).attr("stroke", "white").attr("stroke-width", 3);
			tooltip.html("<div>" +
						    "<div class='m-col-7'><strong>Year:</strong></div>" +
							"<div class='m-col-5'>" + d[year] + "</div>" +
						 "</div><br/>" +
						 "<div>" +
						    "<div class='m-col-7'><strong>Shot %:</strong></div>" +
							"<div class='m-col-5'>" + parseFloat(d[value]).toFixed(2) + "</div>" +
						 "</div>");
			tooltip.style("display","block");
			tooltip.style("top", (d3.event.pageY + common.padding) + "px");
			tooltip.style("left", (d3.event.pageX + common.padding) + "px");
		})
		.on("mouseout",function(d) {
			var oldColor = d3.select(this).attr("fill");
			d3.select(this).attr("stroke", oldColor).attr("stroke-width", 1);
			d3.select("body")
				.select("." + common.tooltip_class)
				.style("display","none");
		});
}

function annotate(which_one) {
	//TODO: create annotation CSS
	//TODO: use d3 to create annotation holders
	//TODO: use d3 to toggle visibility

	var ann = d3.select("body")
					.append("div")
					.attr("class", common.tooltip_class)
					.attr("id", "ann" + which_one)
					.style("display","block") //.style("display", "none")
					.style("position", "absolute")
					tooltip.style("top", (d3.event.pageY + common.padding) + "px");
					tooltip.style("left", (d3.event.pageX + common.padding) + "px");
}

retVal.draw = initialize;
retVal.annotation_1 = function() { annotate(1); }
retVal.annotation_2 = function() { annotate(2); }
retVal.annotation_3 = function() { annotate(3); }

this.teamshots_linechart = retVal;
}();
