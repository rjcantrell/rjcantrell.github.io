!function() {

var retVal = { };

function initialize(svg_container_id, width, height) {
	d3.csv("/skater_shots_summary.csv", function (error, data) {
		if (error) { throw error; }
		update(data, svg_container_id, width, height);
	});
}

function update(data, svg_container_id, width, height) {
    //create SVG elements
    var svg = d3.select("div#" + svg_container_id)
                .attr("class", "scrollable")
                    .append("svg")
                    .attr("width", width + common.margin.left + common.margin.right)
                    .attr("height", height + common.margin.top + common.margin.bottom);

    //TODO: append an iframe or something, for the scrollbar
                //can we get that scrollbar inside, so axis is visible?
                //might need to append two: data inside iframe, axes outside
    //TODO: append an SVG element (or maybe two)
    //TODO: build an X scale and axis
    //TODO: display X axis
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
