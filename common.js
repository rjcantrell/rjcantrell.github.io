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
	common.tooltip = function(id) {
		id = id || "";
		return d3.select("body")
					.append("div")
					.attr("class", common.tooltip_class)
					.attr("id", id)
					.style("display", "none")
					.style("position", "absolute");
	};

	common.linechart_mouseover = function(container_id, produceHtmlFromD) {
		tip_id = "tip_for_" + container_id;
		tooltip = common.tooltip(tip_id);
		d3.selectAll("#" + container_id + " circle")
			.on("mouseover", function(d) {
				d3.select(this).attr("stroke", "white").attr("stroke-width", 3);
				tooltip.html(produceHtmlFromD(d));
				tooltip.style("display","block");
				tooltip.style("top", (d3.event.pageY + common.padding) + "px");
				tooltip.style("left", (d3.event.pageX + common.padding) + "px");
			})
			.on("mouseout",function(d) {
				var oldColor = d3.select(this).attr("fill");
				d3.select(this).attr("stroke", oldColor).attr("stroke-width", 1);
				d3.select("body")
					.select("#" + tip_id)
					.style("display","none");
			});
	}

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
			.attr("stroke", common.colors.major_axes);
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
