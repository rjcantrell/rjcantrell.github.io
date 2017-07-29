!function() {

var retVal = { };

//Name,Position,goals_in_max_shotpct_year,max_shotpct
var name = "Name";
var pos = "Position";
var goals = "goals_in_max_shotpct_year";
var shot_pct = "max_shotpct";

var legend = "scorers_legend";
var font_height = 15;

var pos_colors = {
    "Left Wing": common.colors.primary,
    "Right Wing": common.colors.info,
    "Center":  common.colors.warning,
    "Defender":  common.colors.danger
};

var name_width = 175;

function initialize(svg_container_id, width, height) {
	d3.csv("skater_shots_summary.csv", function (error, data) {
		if (error) { throw error; }
		update(data, svg_container_id, width, height);
	});
}

function update(data, svg_container_id, width, height) {
    var axis_container = d3.select("div#" + svg_container_id + "_axis")
                                .append("svg")
                                .attr("width", width)
                                .attr("height", 25);

    //create SVG elements
    var svg = d3.select("div#" + svg_container_id)
                .attr("style", "height: " + height + "px; ")
                .classed("scrollable", true)
                    .append("svg")
                    .attr("width", width)
                    .attr("height", font_height * data.length + common.margin.top + common.margin.bottom)
                    .classed("home", true);

    //TODO: build an X scale and axis
    //create scales used to display line-chart points
    var xScale = d3.scaleLinear()
                         .domain([d3.min(data, function(d) { return +d[shot_pct]; }),
                                  d3.max(data, function(d) { return +d[shot_pct]; })])
                         .range([name_width, width - (common.margin.left + common.margin.right)]);

    var radScale = d3.scaleLinear()
                        .domain([d3.min(data, function(d) { return +d[goals]; }),
                                 d3.max(data, function(d) { return +d[goals]; })])
                        .range([2, 20]);

    svg.append("g").classed("names", true).selectAll("text")
        .data(data)
        .enter()
        .append("text")
            .attr("x", function(d,i) { return 5; })
            .attr("y", function(d,i) { return common.padding + font_height * i; })
            .attr("fill", common.colors.major_axes)
            .text(function(d) { return d[name];})

    svg.append("g").classed("points", true).selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", function(d,i) { return radScale(d[goals]); })
        .attr("cx", function(d,i) { return xScale(d[shot_pct]); })
        .attr("cy", function(d,i) { return font_height + font_height * i; })
        .attr("fill", function(d,i) { return pos_colors[d[pos]]; });

    var xAxis = d3.axisTop(xScale).tickFormat(d3.format(".0f"));
    var axes = axis_container.append("g").attr("id", common.group_axes);
	var xAxisGroup = axes.append("g").attr("id", "x-axis");
	var boundCustomXAxis = common.customXAxis.bind(null, xAxisGroup, xAxis);
	xAxisGroup.attr("transform", "translate(0," + common.padding + ")")
    			.call(boundCustomXAxis);

    for (var p in pos_colors) {
        var legend_row = d3.select("div#" + legend)
                                .append("div")
                                .classed("row", true)

        legend_row.append("div")
                  .classed("col-xs-2", true)
                        .append("svg")
                        .attr("height", common.padding)
                        .attr("width", common.padding)
                        .classed("padded", true)
                            .append("rect")
                            .attr("height", 10)
                            .attr("width", 10)
                            .attr("fill", pos_colors[p]);

        legend_row.append("div")
                  .classed("col-xs-10", true)
                        .append("label")
                        .text(p);
    }

    //tooltips
    common.linechart_mouseover(svg_container_id, function(d) {
       return "<div class='row'>" +
                  "<div class='col-xs-12'>" + d[name] + "</div>" +
              "</div>" +
              "<div class='row'>" +
                   "<div class='col-xs-9'><strong>Best Shot %:</strong></div>" +
                   "<div class='col-xs-3'>" + d[shot_pct] + "</div>" +
               "</div>" +
               "<div class='row'>" +
                   "<div class='col-xs-9'><strong>Goals That Year:</strong></div>" +
                   "<div class='col-xs-3'>" + d[goals] + "</div>" +
               "</div>"
    });
}

retVal.draw = initialize;

this.playershots_ranking = retVal;
}();
