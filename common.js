!function() {
	var common = { };

	common.padding = 20;
	common.margin = { top: 50, right: 50, bottom: 50, left: 50 };

	common.colors =
	{
		danger: "#e74c3c",		//from Bootstrap-Darkly.
		warning: "#f39c12",		//I wish SVGs could consume existing HTML-CSS
		success: "#00bc8c",		//do they turn their nose down at the plebian "color:"?

		major_axes: "white",
		minor_axes: "#555",
	};

	common.tooltip_class = "d3-tip";
	common.tooltip = function() {
		return d3.select("body")
					.append("div")
					.attr("class", common.tooltip_class)
					.style("display", "none")
					.style("position", "absolute");
	};

	common.named_tooltip = function(name) {
		return d3.select("body")
					.append("div")
					.attr("class", common.tooltip_class)
					.attr("id", name)
					//.style("display", "none")
					.style("position", "absolute");
	};

	common.lineGen = function(xScale, yScale, xKey, yKey) {
		return d3.line()
		  .x(function(d) { return xScale(d[xKey]); })
		  .y(function(d) { return yScale(d[yKey]); });
	};

	common.customXAxis = function(g, xAxis) {
		g.call(xAxis);
		g.selectAll(".domain")
			.attr("stroke", common.colors.major_axes);

		g.selectAll(".tick text")
			.attr("class","axes")
			.attr("stroke", common.colors.major_axes);

		g.selectAll(".tick line")
			.attr("stroke", common.colors.major_axes)
	};

	common.customYAxis = function(g, yAxis, width) {
		g.call(yAxis);
		g.selectAll(".domain")
			.attr("stroke", common.colors.major_axes);

		g.selectAll(".tick text")
			.attr("class","axes")
			.attr("stroke", common.colors.major_axes);

		g.selectAll(".tick line")
			.attr("stroke", common.colors.minor_axes)
			.attr("stroke-dasharray", "2,2")
			.attr("x2", width - common.margin.left - common.margin.right - common.padding * 2);
	};

	this.common = common;
}();
