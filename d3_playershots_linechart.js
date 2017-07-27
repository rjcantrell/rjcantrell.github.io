!function() {

var retVal = { };

var stat_shotpct = "avg_shotpct";
var stat_recordcount = "record_count";
var age = "age";
var pos = "position";

var panel_radio = "chart2_statpanel";
var panel_checks = "chart2_positionpanel";

var group_axes = "axes";

var positions = {
	lw: "Left Wing",
	rw: "Right Wing",
	c: "Center",
	d: "Defender"
}

var skater_data = {
	lw: [],
	rw: [],
	c: 	[],
	d:  [],
}

function initialize(svg_container_id, width, height) {
	d3.csv("/skater_stats_summary.csv", function (error, data) {
		if (error) { throw error; }
		
		for (var p in positions) {
			skater_data[p] = data.filter(function(row) { return row[pos] == positions[p] });
		}
		
		this.svg_container_id = svg_container_id;
		this.width = width;
		this.height = height;
		
		build();
		update();
	});
}

function build() {
		var common = this.common;
		var container = d3.select("div#" + this.svg_container_id);
		
		//create SVG elements
		var svg = container.append("svg")
					.attr("width", this.width + common.margin.left + common.margin.right)
					.attr("height", this.height + common.margin.top + common.margin.bottom);
		
		//radio buttons for available stats
		
		//checkboxes for positions displayed (in #chart2_positionpanel)
		check_panel = d3.select("div#chart2_positionpanel");
		
		if (!check_panel.empty()) {
			/* Burn down through D3 to get the underlying JS impl of DOM nodes
			if (!check_panel.empty()) {
			check_panel				//the d3 selection we just made
			._groups[0]				//has a member representing the selected things. Take the first
			[0]						//at this point, it's a regular ol' JS {Object}.
			.parentNode				//traverse the DOM one upward
			.classList				//preferred way as of es6, I think?
			.remove("invisible");	//FINALLY.*/
			check_panel._groups[0][0].parentNode.classList.remove("invisible");
		}
		
		for (var p in positions) {
			chkID = p;
			
			var check_row = check_panel.append("div")
				.attr("class", "row");
				
			check_row.append("input")
						.attr("type", "checkbox")
						.attr("class", "padded")
						.attr("style", "margin-left: 15px") //Should this be in CSS? Am I a bad person?
						.attr("checked", true)
						.attr("id", chkID)
						.on("change", function() { update(); } );
				
			check_row.append("label")
						.attr("for", chkID)
						.text(positions[p]);
		}
}

//doesn't need parameters since it can ask the checkboxes which data to show
function update() {
	
	var data = [];
	
	//decide which data to plot based on which checkboxes are checked
	var checks = d3.select("div#" + panel_checks)
				.selectAll("input")
				.filter(function() { return this.type == "checkbox"; }) 
				.filter(function() { return this.checked == true })
				._groups[0]; //this is dumb, but if I don't, I get a d3 selection object, not the inputs
	
	//build a dataset from positions' component datasets
	checks.forEach(function(e) { data = data.concat(skater_data[e.id]); });
	
	//remove unnecessary fields, calculate average-of-averages for positions chosen
	data = plottable_by_age(data, stat_shotpct);
	
	//create scales used to display line-chart points
	var xScale = d3.scaleLinear()
					.domain([d3.min(data, function(d) { return +d[age]; }),
							 d3.max(data, function(d) { return +d[age]; })])
					.range([common.margin.left, this.width - (common.margin.left + common.margin.right)]);
						 
	//TODO: should you just not set a scale until a stat is chosen? probably should set it based on whatever stat you show first, then also redo the scale (and Y axis) if a different stat is chosen
	var yScale = d3.scaleLinear()
				 .domain([d3.min(data, function(d) { return +d[stat_shotpct]; }),
						  d3.max(data, function(d) { return +d[stat_shotpct]; })])
				 .range([this.height, common.margin.top]);//SVG coords are backwards
				
	//draw and label axes
	var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0f"));
	var yAxis = d3.axisLeft(yScale);
	
	//TODO: is it better to remove and recreate or upsert the item?
	//probably upsert, if you're going to animate between them...
	var svg = d3.select("div#" + this.svg_container_id)
					.select("svg");
	
	//or, remove and re-add.
	svg.select("g").filter(function() { return this.id == group_axes; }).remove();
	var axes = svg.append("g").attr("id", group_axes);
	
	//show X axis
	axes.append("g")
		.attr("id", "x_axis")
		.attr("transform", "translate(0," + this.height + ")")
		.call(xAxis);
		
	//show Y axis
	var yAxisGroup = axes.append("g").attr("id","y_axis");
	
	var boundCustomYAxis = common.customYAxis.bind(null, yAxisGroup, yAxis, this.width);
	
	yAxisGroup.attr("transform", "translate(" + common.margin.left + ",0)")
		.call(boundCustomYAxis);
	
	//TODO: remove line
	//TODO: remove points
	
	//line-maker function
	var lineGen = common.lineGen.bind(this, xScale, yScale, age, stat_shotpct)();
	
	svg.selectAll("path").remove();
	
	//dataset line
	svg.append("svg:path")
		   .attr("d", lineGen(data))
		   .attr("stroke", "blue")
		   .attr("stroke-width", 2)
		   .attr("fill", "none");
		   
	svg.selectAll("." + stat_shotpct).remove();
	
	//dataset points
	svg.selectAll("." + stat_shotpct)
		   .data(data)
		   .enter()
		   .append("circle")
		   .merge(svg)
		   .attr("class", stat_shotpct)
		   .attr("cx", function(d) { return xScale(d[age]); })
		   .attr("cy", function(d) { return yScale(d[stat_shotpct]); })
		   .attr("fill", "blue")
		   .attr("r","5");
}

function upsert_element_by_id(container, tag, id) {
	var exists = container.select(tag)
		.filter(function() { return this.id == id }); //.append("g");
	
	if (axes_exist.empty())	{
		svg.append(tag).attr("id", id);
		retVal = container.select(tag)
							.filter(function() { return this.id == id });
	} else {
		retVal = exists;
	}
	
	return retVal;
}

function plottable_by_age(data, column_name) {
	retVal = [];
	
	function add(a, b) { return a + b; }
	
	var ages = new Set(data.map(function(d) { return +d[age]; }));
	
	ages.forEach(function(a) { //probably a more functional way to do this...
	
		//get every row for this age
		var rows = data.filter(function(d) { return d[age] == a; });
		
		//get all instances of this stat (an avg) for this age, multiplied by 
		//the record count that made that average, to make "raw data" from which to average
		var stats = rows.map(function(d) { 
			return { "count": +d[stat_recordcount], "raw_stat": +d[column_name] * +d[stat_recordcount] }; 
		});
		
		var total_stat = stats.map(function(d) { return +d["raw_stat"]; }).reduce((a, b) => a + b, 0);
		var total_count = stats.map(function(d) { return +d["count"]; }).reduce((a, b) => a + b, 0);
		
		var this_age_stat = { age: a };
		this_age_stat[column_name] = total_stat / total_count; 
		retVal.push(this_age_stat);
	});
	
	return retVal;
}

retVal.draw = initialize;
retVal.update = update;

this.playershots_linechart = retVal;
}();