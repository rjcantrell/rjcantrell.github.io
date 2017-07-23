!function() {
	var common = { };

	common.padding = 20;
	common.margin = { top: 20, right: 20, bottom: 20, left: 20 };
	
	common.axiscolor = "#777";
	common.tooltip_class = "d3-tip";
	
	common.tooltip = function() { 
		return d3.select("body")
					.append("div")
					.attr("class", common.tooltip_class)
					.style("display", "none")
					.style("position", "absolute");
	};
	
	common.lineGen = function(xScale, yScale, xKey, yKey) { 
		return d3.line()
		  .x(function(d) { return xScale(d[xKey]); })
		  .y(function(d) { return yScale(d[yKey]); });
	};
	
	common.customYAxis = function(g, yAxis, width) {
		g.call(yAxis);
		g.selectAll(".tick line")
			.attr("stroke", "#555")
			.attr("stroke-dasharray", "2,2")
			.attr("x2", width - common.margin.left - common.margin.right - common.padding);
	};
	
	this.common = common;
}();