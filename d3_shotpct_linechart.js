!function() {

var retVal = { };

var measure = "Measure";
var year = "Year";
var value = "Value";
var avg = "avg";
var min = "min";
var max = "max";
var maxcolor = "red";
var mincolor = "blue";
var avgcolor = "gray";

function draw_chart(svg_container_id, width, height) {
	
	d3.csv("/shotpct_team_by_year_summary.csv", function (error, data) {
		if (error) { throw error; }

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
		
		//draw and label axes
		var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0f"));
		var yAxis = d3.axisLeft(yScale);
		
		axes = svg.append("g");
		
		//show X axis
		axes.append("g")
			.attr("transform", "translate(0," + height + ")")
    		.call(xAxis);
			
		//show Y axis
		var yAxisGroup = axes.append("g");
		
		var boundCustomYAxis = common.customYAxis.bind(null, yAxisGroup, yAxis, width);
		
		//TODO: should this attr go into common.customYAxis?
		yAxisGroup.attr("transform", "translate(" + common.margin.left + ",0)")
			.call(boundCustomYAxis);
		
		//tooltips
		var tooltip = common.tooltip();
		
		//TODO: trim d[value] to X decimal places
		svg.selectAll("circle")
			.on("mouseover", function(d) {
				tooltip.html("<strong>Year: " + d[year] + "</strong><br/>" + 
						       "<strong>Shot %: " + d[value] + "</strong>");
				tooltip.style("display","block");
				tooltip.style("top", (d3.event.pageY + common.padding) + "px");
				tooltip.style("left", (d3.event.pageX + common.padding) + "px");
			})
			.on("mouseout",function(d) { 
				d3.select("body")
					.select("." + common.tooltip_class)
					.style("display","none");  
			});
	});
}

retVal.draw = draw_chart;
this.teamshots_linechart = retVal;
}();