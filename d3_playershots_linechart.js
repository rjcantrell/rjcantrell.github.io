!function() {

var retVal = { };

//not part of "stats" because while they're in the file,
//we don't allow user choice on how to use these
var age = "age";
var pos = "position";
var record_count = "record_count";

var panel_radio = "playershots_statpanel";
var panel_checks = "playershots_positionpanel";

var group_axes = "axes";

var stats = {
	"avg_shotpct": "Shot Percentage",
	"avg_plus_minus": "Plus/Minus",
	"avg_goals": "Goals",
	"avg_shot": "Shots Taken"
};

var positions = {
	"lw": "Left Wing",
	"rw": "Right Wing",
	"c": "Center",
	"d": "Defender"
};

var skater_data = {
	lw: [],
	rw: [],
	c: 	[],
	d:  [],
};

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

		/* Burn down through D3 to get the underlying JS impl of DOM nodes
		if (!check_panel.empty()) {
		check_panel				//the d3 selection we just made
		._groups[0]				//has a member representing the selected things. Take the first
		[0]						//at this point, it's a regular ol' JS {Object}.
		.parentNode				//traverse the DOM one upward
		.classList				//preferred way as of es6, I think?
		.remove("invisible");	//FINALLY.*/

		//radio buttons for available stats
		var radio_panel = d3.select("div#" + panel_radio)
		if (!radio_panel.empty()) {
			radio_panel._groups[0][0].parentNode.classList.remove("invisible");
		}

		var have_checked_one = false;
		for (var s in stats) {
			var radio_row = radio_panel.append("div")
				.attr("class", "row");

			radio_row.append("input")
					.attr("type", "radio")
					.attr("class", "padded")
					.attr("style", "margin-left: 15px")
					.attr("name", "stats_group")
					.attr("id", s)
					.property("checked", function() {
						if (!have_checked_one) {
							have_checked_one = true;
							return true;
						}
						return false;
					})
					.on("change", function() { update(); });

			radio_row.append("label")
						.attr("for", s)
						.text(stats[s]);
		}

		//checkboxes for positions displayed (in #playershots_positionpanel)
		var check_panel = d3.select("div#playershots_positionpanel");
		if (!check_panel.empty()) {
			check_panel._groups[0][0].parentNode.classList.remove("invisible");
		}

		for (var p in positions) {
			var check_row = check_panel.append("div")
				.attr("class", "row");

			check_row.append("input")
						.attr("type", "checkbox")
						.attr("class", "padded")
						.attr("style", "margin-left: 15px") //Should this be in CSS? Am I a bad person?
						.attr("checked", true)
						.attr("id", p)
						.on("change", function() { update(); } );

			check_row.append("label")
						.attr("for", p)
						.text(positions[p]);
		}
}

//doesn't need parameters since it can ask the checkboxes which data to show
function update() {

	var data = [];
	//decide which stat to plot
	var selected_radio = d3.select("div#" + panel_radio)
							.selectAll("input")
							.filter(function() { return this.checked == true })
							._groups[0][0];

	var stat_to_plot = selected_radio.id;

	//decide which players' data to plot based on which checkboxes are checked
	var checks =  d3.selectAll("div#" + panel_checks + " input")
						.filter(function() { return this.checked == true })
						._groups[0]; //this is dumb, but if I don't, I get a d3 selection object, not the inputs

	//build a dataset from positions' component datasets
	checks.forEach(function(e) { data = data.concat(skater_data[e.id]); });

	//remove unnecessary fields, calculate average-of-averages for positions chosen
	data = plottable_by_age(data, stat_to_plot);

	//create scales used to display line-chart points
	var xScale = d3.scaleLinear()
					.domain([d3.min(data, function(d) { return +d[age]; }),
							 d3.max(data, function(d) { return +d[age]; })])
					.range([common.margin.left, this.width - (common.margin.left + common.margin.right)]);

	//TODO: should you just not set a scale until a stat is chosen? probably should set it based on whatever stat you show first, then also redo the scale (and Y axis) if a different stat is chosen
	var yScale = d3.scaleLinear()
				 .domain([d3.min(data, function(d) { return +d[stat_to_plot]; }),
						  d3.max(data, function(d) { return +d[stat_to_plot]; })])
				 .range([this.height, common.margin.top]);//SVG coords are backwards

	//draw and label axes
	var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0f"));
	var yAxis = d3.axisLeft(yScale);

	//TODO: probably better to use the general update pattern here...
	var svg = d3.select("div#" + this.svg_container_id)
					.select("svg");

	//but, let's remove and re-add because there's a deadline
	svg.select("g#" + group_axes).remove();
	var axes = svg.append("g").attr("id", group_axes);

	//show X axis
	var xAxisGroup = axes.append("g").attr("id", "x-axis");
	var boundCustomXAxis = common.customXAxis.bind(null, xAxisGroup, xAxis);
	xAxisGroup.attr("transform", "translate(0," + height + ")")
    			.call(boundCustomXAxis);

	//show Y axis
	var yAxisGroup = axes.append("g").attr("id","y-axis");
	var boundCustomYAxis = common.customYAxis.bind(null, yAxisGroup, yAxis, width);
	yAxisGroup.attr("transform", "translate(" + common.margin.left + ",0)")
				.call(boundCustomYAxis);

	//line-maker function
	var lineGen = common.lineGen.bind(this, xScale, yScale, age, stat_to_plot)();

	svg.selectAll("path").remove();

	//dataset line
	svg.append("svg:path")
		   .attr("d", lineGen(data))
		   .attr("stroke", common.colors.success)
		   .attr("stroke-width", 2)
		   .attr("fill", "none");

	//NICE-TO-HAVE: can we animate this instead of removing and re-adding?
	svg.selectAll("circle").remove();

	//dataset points
	svg.selectAll("." + stat_to_plot)
		   .data(data)
		   .enter()
		   .append("circle")
		   .merge(svg)
		   .attr("class", stat_to_plot)
		   .attr("cx", function(d) { return xScale(d[age]); })
		   .attr("cy", function(d) { return yScale(d[stat_to_plot]); })
		   .attr("fill", common.colors.success)
		   .attr("r","5");
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
			return { "count": +d[record_count], "raw_stat": +d[column_name] * +d[record_count] };
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
