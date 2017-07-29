!function() {

var retVal = { };

//not part of "stats" because while they're in the file,
//we don't allow user choice on how to use these
var age = "age";
var pos = "position";
var record_count = "record_count";

//HTML div IDs in which we want to add data-driven controls
var panel_radio = "playershots_statpanel";
var panel_checks = "playershots_positionpanel";

var stats = {
	"avg_shotpct": "Shot Percentage",
	"avg_plus_minus": "Plus/Minus",
	"avg_goals": "Goals",
	"avg_shot": "Shots Taken"
};

var skater_data = {
	lw: [],
	rw: [],
	c: 	[],
	d:  [],
};

//how long should all transitions on the page take?
var transTime = d3.transition().duration(750);

function initialize(svg_container_id, width, height) {
	d3.csv("skater_stats_summary.csv", function (error, data) {
		if (error) { throw error; }

		for (var p in common.positions) {
			skater_data[p] = data.filter(function(row) { return row[pos] == common.positions[p] });
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
				.attr("height", this.height + common.margin.top + common.margin.bottom)
				.classed("home", true);

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
			.classed("row", true);

		radio_row.append("input")
				.attr("type", "radio")
				.classed("padded", true)
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
	var check_panel = d3.select("div#" + panel_checks);
	if (!check_panel.empty()) {
		check_panel._groups[0][0].parentNode.classList.remove("invisible");
	}

	for (var p in common.positions) {
		var check_row = check_panel.append("div")
			.classed("row", true);

		check_row.append("input")
					.attr("type", "checkbox")
					.classed("padded", true)
					.attr("style", "margin-left: 15px") //Should this be in CSS? Am I a bad person?
					.attr("checked", true)
					.attr("id", p)
					.on("change", function() { update(); } );

		check_row.append("label")
					.attr("for", p)
					.text(common.positions[p]);
	}
}

//doesn't need parameters since it can ask the checkboxes which data to show
function update() {
	var data = [];
	//decide which stat to plot
	var selected_radio = d3.selectAll("div#" + panel_radio + " input")
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

	var svg = d3.select("div#" + this.svg_container_id + " svg");

	//but, let's remove and re-add because there's a deadline
	svg.select("g." + common.group_axes).remove();
	var axes = svg.append("g").classed("axes", true);
	common.xBottom(axes, xScale, "translate(0," + height + ")");
	common.yLeft(axes, yScale,  "translate(" + common.margin.left + ",0)", width);

	//line-maker function
	var lineGen = common.lineGen.bind(this, xScale, yScale, age, stat_to_plot)();

	//dataset line
	var line = svg.selectAll("path.statline")
				.data(data);

	//we'll only have an exit to fade out if we choose a plotting that has a
	//different number of datapoints than our old line.exit()
	line.exit()
		.style("opacity", 1e-6)
		.remove();

	line = line.enter()
		.append("svg:path") //if this gets inserted once, we shouldn't have an enter afterward
			.classed("statline", true)
			.attr("opacity", 1e-6)
			.merge(line)
			.attr("stroke", common.colors.success)
			.attr("stroke-width", 2)
			.attr("fill", "none")
			.transition(transTime)
				.attr("opacity", 1)
			   .attr("d", lineGen(data))
			   ;

	//dataset points
	var points = svg.selectAll("circle")
		   .data(data);

	//fade out old points not in the new selection
	points.exit()
			.transition(transTime)
				.style("fill-opacity", 1e-6)
				.remove();

	//fade in new points
	points.enter()
			.append("circle")
			.merge(points) //everything below applies to enter + update
			.classed(stat_to_plot, true)
			.attr("fill", common.colors.success)
			.attr("r","5")
			.transition(transTime)
				.attr("cx", function(d) { return xScale(d[age]); })
				.attr("cy", function(d) { return yScale(d[stat_to_plot]); })
				;

	common.linechart_mouseover(svg_container_id,function(d) {
	   return "<div>" +
				   "<div class='m-col-7'><strong>Age:</strong></div>" +
				   "<div class='m-col-5'>" + d[age] + "</div>" +
			   "</div><br/>" +
			   "<div>" +
				   "<div class='m-col-7'><strong>Value:</strong></div>" +
				   "<div class='m-col-5'>" + parseFloat(d[stat_to_plot]).toFixed(2) + "</div>" +
			   "</div>"
	});
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
