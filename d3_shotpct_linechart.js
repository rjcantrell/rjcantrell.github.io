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
		//add_annotations();
	});

	//forget it all. I'm just going to put this on the button that drives it, instead
	//of figuring out how to float bootstrap divs over the svg in a way that is reproducible
	//and not seemingly random (and prey to the fact that nth-child doesn't work if popover
	//literally removes it from the DOM)

	//beyond here are only ghosts...

	//if not in a func, this happens first, because update() is async and will likely finish later.
	//Should it be here? You'd have better control over where to stick these things
	//in terms of (x,y) than just making a parent-child relationship to the empty
	//box.
	//function add_annotations() {
		//create containers for annotation popovers to be dropped into
		//style doesn't seem to be respected - placement is centered below svg area

		/*
		var ann_row = d3.select("div#" + svg_container_id)
						.append("div")
							.classed("row", true)
							.classed("ann_row", true)
							.attr("style","height: 1px;");

		[1,2,3].forEach(i => Array(i).fill(i).forEach(_ => { //this syntax is kinda gross
			ann_row.append("div")
					.attr("class", "xs-col-2")
					.html("&nbsp;");
		}))

		var ann1 = d3.select("div#" + svg_container_id).append("div")
							.classed("annotation1", true)
							.classed("")
							.attr("id", "teamshots_annotation1")
							.attr("data-original-title", "1974")
							.attr("data-content", "The first modern 'cage' style goalie masks are introduced, and the last goalie to play without a mask retires")
							.attr("data-placement", "bottom")
							.attr("style", "top: 10px !important; left: 60px !important;")
							;

		var ann2 = d3.select("div#" + svg_container_id).append("div")
							.attr("class","annotation2")
							.attr("id", "teamshots_annotation2")
							.attr("data-original-title", "1986")
							.attr("data-content", "Patrick Roy popularizes 'butterfly'-style goaltending, winning the Stanley Cup as a rookie. It remains the dominant style today. Goalies also start wearing grotesquely-large shoulder and leg pads")
							.attr("data-placement", "top")
							.attr("style", "top: 110px !important; left: 160px !important;")
							;

		var ann3 = d3.select("div#" + svg_container_id).append("div")
							.attr("class","annotation3")
							.attr("id", "teamshots_annotation3")
							.attr("data-original-title", "2006")
							.attr("data-content", "During the lockout year, the NHL develops new rules to increase scoring. These include restrictions on maximum goalie pad size, legalization of the 'two-line pass', and a prohibition on goalies playing the puck in the corners of the rink")
							.attr("data-placement", "top")
							.attr("style", "top: 210px !important; left: 260px !important;")
							;
		*/
	//}
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
					.attr("height", height + common.margin.top + common.margin.bottom)
					.classed("home", true);

	//label axes
	svg.append("text")
		.attr("class", "y-label")
	    .attr("text-anchor", "end")
		.attr("fill", common.colors.major_axes)
	    .attr("y", 0)
		.attr("x", height / 4 * -1 )
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)")
	    .text("Shot Percentage: Goals / Shots Attempted");

	var axes = svg.append("g").attr("class", common.group_axes);
	common.xBottom(axes, xScale, "translate(0," + height + ")");
	common.yLeft(axes, yScale,  "translate(" + common.margin.left + ",0)", width);

	//max line
	svg.append("g").classed("max_line", true).append("svg:path")
		   .attr("d", lineGen(maxes))
		   .attr("stroke", maxcolor)
		   .attr("stroke-width", 2)
		   .attr("fill", "none");

	//min line
	svg.append("g").classed("min_line", true).append("svg:path")
		   .attr("d", lineGen(mins))
		   .attr("stroke", mincolor)
		   .attr("stroke-width", 2)
		   .attr("fill", "none");

	//avg line
	svg.append("g").classed("avg_line", true).append("svg:path")
		   .attr("d", lineGen(avgs))
		   .attr("stroke", avgcolor)
		   .attr("stroke-width", 2)
		   .attr("fill", "none");

	//max datapoints
	svg.append("g").classed("maxes", true).selectAll("." + max)
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
	svg.append("g").classed("mins", true).selectAll("." + min)
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
	svg.append("g").classed("avgs", true).selectAll("." + avg)
		   .data(avgs)
		   .enter()
		   .append("circle")
		   .merge(svg)
		   .attr("class", avg)
		   .attr("cx", function(d) { return xScale(d[year]); })
		   .attr("cy", function(d) { return yScale(d[value]); })
		   .attr("fill", avgcolor)
		   .attr("r","5");

	common.linechart_mouseover("teamshots",function(d) {
		return "<div>" +
					"<div class='m-col-7'><strong>Year:</strong></div>" +
					"<div class='m-col-5'>" + d[year] + "</div>" +
				"</div><br/>" +
				"<div>" +
					"<div class='m-col-7'><strong>Shot %:</strong></div>" +
					"<div class='m-col-5'>" + parseFloat(d[value]).toFixed(2) + "</div>" +
				"</div>"
	});
}

retVal.draw = initialize;

this.teamshots_linechart = retVal;
}();
