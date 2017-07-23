!function() {

var retVal = { };

var stat_shotpct = "Avg. S%";
var age = "Age";
var pos = "Position";
var chkGroupName = "chkGroup";

var positions = {
	lw: "Left Wing",
	rw: "Right Wing",
	c: "Center",
	d: "Defender"
}

function draw_chart(svg_container_id, width, height) {
	d3.csv("/skater_stats_summary.csv", function (error, data) {
		if (error) { throw error; }
		
		var common = this.common;
		
		//TODO: make these class variables so you only need to filter once, and the update method can re-use them!
		var skaters_lw = data.filter(function(row) { return row[pos] == positions.lw });
		var skaters_rw = data.filter(function(row) { return row[pos] == positions.rw });
		var skaters_c = data.filter(function(row) { return row[pos] == positions.c });
		var skaters_d = data.filter(function(row) { return row[pos] == positions.d });
		
		//create scales used to display line-chart points
		var xScale = d3.scaleLinear()
					 .domain([d3.min(data, function(d) { return +d[age]; }),
							  d3.max(data, function(d) { return +d[age]; })])
					 .range([common.margin.left, width - (common.margin.left + common.margin.right)]);
							 
		//TODO: should you just not set a scale until a stat is chosen? probably should set it based on whatever stat you show first, then also redo the scale (and Y axis) if a different stat is chosen
							 
		var yScale = d3.scaleLinear()
					 .domain([d3.min(data, function(d) { return +d[stat_shotpct]; }),
							  d3.max(data, function(d) { return +d[stat_shotpct]; })])
					 .range([height, common.margin.top]);//SVG coords are backwards

		//create SVG elements
		var svg = d3.select("div#" + svg_container_id)
					.append("svg")
					.attr("width", width + common.margin.left + common.margin.right)
					.attr("height", height + common.margin.top + common.margin.bottom);
					
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
		
		yAxisGroup.attr("transform", "translate(" + common.margin.left + ",0)")
    		.call(boundCustomYAxis);
		
		//TODO: plot data
		//this should probably be a function that takes a dataset, so I can just call this when switching items plotted
		
		//checkboxes for positions displayed
		var container = d3.select("div#" + svg_container_id);
		
		chkGroup = container.append("g")
					.attr("id", chkGroupName);
					
		for (var p in positions) {
			chkID = "chk_" + p;
			
			chkGroup.append("input")
				.attr("type", "checkbox")
				.attr("checked", true)
				.attr("id", chkID);
				
			chkGroup.append("label")
				.attr("for", chkID)
				.text(positions[p]);
				
			//TODO: wire these checkboxes' onclick with a function to change the plotted data!
		}
		
		//TODO: add radio buttons for stat displayed
	});
}

retVal.draw = draw_chart;

this.playershots_linechart = retVal;
}();