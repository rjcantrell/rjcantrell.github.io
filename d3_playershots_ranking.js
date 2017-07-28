!function() {

var retVal = { };

//Name,Position,goals_in_max_shotpct_year,max_shotpct
var name = "Name";
var pos = "Position";
var goals = "goals_in_max_shotpct_year";
var shot_pct = "max_shotpct";

function initialize(svg_container_id, width, height) {
	d3.csv("/skater_shots_summary.csv", function (error, data) {
		if (error) { throw error; }
		update(data, svg_container_id, width, height);
	});
}

function update(data, svg_container_id, width, height) {

    var font_height = 15;

    //create SVG elements
    var svg = d3.select("div#" + svg_container_id)
                .attr("style", "height: " + height + "px;" )
                .attr("class", "scrollable")
                    .append("svg")
                    .attr("width", width + common.margin.left + common.margin.right)
                    .attr("height", font_height * data.length + common.margin.top + common.margin.bottom)
                    .classed("home", true);

    //TODO: build an X scale and axis
    //create scales used to display line-chart points
    var xScale = d3.scaleLinear()
                         .domain([d3.min(data, function(d) { return +d[shot_pct]; }),
                                  d3.max(data, function(d) { return +d[shot_pct]; })])
                         .range([common.margin.left + 100, width - (common.margin.left + common.margin.right)])

    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
            .attr("x", function(d,i) { return 5; })
            .attr("y", function(d,i) { return common.padding + font_height * i; })
            .attr("fill", common.colors.major_axes)
            .text(function(d) { return d[name];})

    //show X axis
    var xAxis = d3.axisTop(xScale).tickFormat(d3.format(".0f"));
    var axes = svg.append("g").attr("id", group_axes);
	var xAxisGroup = axes.append("g").attr("id", "x-axis");
	var boundCustomXAxis = common.customXAxis.bind(null, xAxisGroup, xAxis);
	xAxisGroup.attr("transform", "translate(0," + height + ")")
    			.call(boundCustomXAxis);

    //TODO: for each data element, plot the name on the left
    //TODO: for each data element, plot a circle along the X axis
                //cx is driven by shot_pct value
                //cy is driven by data index
                //size is driven by "goals that year" value
                //color is driven by position
    //TODO: add legend
    //TODO: add filters?
}

retVal.draw = initialize;

this.playershots_ranking = retVal;
}();
