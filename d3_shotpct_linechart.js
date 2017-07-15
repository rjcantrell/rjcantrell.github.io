//define constants we may want to use later
var source = "http://localhost:8000"; //"."
var padding = 20;
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
	
	d3.csv(source + "/shotpct_team_by_year_summary.csv", function (error, data) {
		if (error) { throw error; }
		
		//separate avg, min, and max series for separate plotting
		var maxes = data.filter(function(row) { return row[measure] == max });
		var mins = data.filter(function(row) { return row[measure] == min });
		var avgs = data.filter(function(row) { return row[measure] == avg });
		
		//create scales used to display line-chart points
		var xScale = d3.scaleLinear()
							 .domain([d3.min(data, function(d) { return +d[year]; }),
									  d3.max(data, function(d) { return +d[year]; })])
							 .range([padding, width - padding*2])
							 
		var yScale = d3.scaleLinear()
							 .domain([d3.min(data, function(d) { return +d[value]; }),
									  d3.max(data, function(d) { return +d[value]; })])
							 .range([height - padding*2, padding]) //SVG coords are backwards
		
		//line-maker function
		var lineGen = d3.svg.line()
							  .x(function(d) { return xScale(d[year]); })
							  .y(function(d) { return yScale(d[value]); });
		
		//create SVG elements
		var svg = d3.select("div#" + svg_container_id)
					.append("svg")
					.attr("width", width)
					.attr("height", height);
					
		svg.selectAll("." + max)
		   .data(maxes)
		   .enter()
		   .append("circle")
		   .merge(svg)
		   .attr("class", max)
		   .attr("cx", function(d) { return xScale(d[year]); })
		   .attr("cy", function(d) { return yScale(d[value]); })
		   .attr("fill", maxcolor)
		   .attr("r","5")
		   
		avg.append("svg:path")
		   .attr("d", lineGen(maxes))
		   .attr("stroke", maxcolor)
		   .attr("stroke-width", 2)
		   .attr("fill", "none");
		   
		svg.selectAll("." + min)
		   .data(mins)
		   .enter()
		   .append("circle")
		   .merge(svg)
		   .attr("class", min)
		   .attr("cx", function(d) { return xScale(d[year]); })
		   .attr("cy", function(d) { return yScale(d[value]); })
		   .attr("fill", mincolor)
		   .attr("r","5")
		   
		svg.selectAll("." + avg)
		   .data(avgs)
		   .enter()
		   .append("circle")
		   .merge(svg)
		   .attr("class", avg)
		   .attr("cx", function(d) { return xScale(d[year]); })
		   .attr("cy", function(d) { return yScale(d[value]); })
		   .attr("fill", avgcolor)
		   .attr("r","5")
		
		//TODO: attach max S% to SVG
		//TODO: draw points for max S%
		//TODO: draw line for max S%
		
		//TODO: draw and label axes
		
		//TODO: attach min S% to SVG
		//TODO: draw points for min S%
		//TODO: draw line for min S%
		
		//TODO: attach avg S% to SVG
		//TODO: draw points for avg S%
		//TODO: draw line for avg S%
		
		//TODO: add annotations
	});
}