!function() {
	var common = { };

	common.padding = 20;
	common.margin = { top: 50, right: 50, bottom: 50, left: 50 };

	common.colors =
	{
		primary: "#375a7f",
		info: 	 "#3498db",
		danger:  "#e74c3c",		//from Bootstrap-Darkly.
		warning: "#f39c12",		//I wish SVGs could consume existing HTML-CSS
		success: "#00bc8c",		//do they turn their nose down at the plebian "color:"?

		major_axes: "white",
		minor_axes: "#555",
	};

	common.positions = {
		"lw": "Left Wing",
		"rw": "Right Wing",
		"c": "Center",
		"d": "Defender"
	};

	common.tooltip_class = "d3-tip";
	common.group_axes = "axes";
	common.tooltip = function() {
		var tip = d3.select("." + common.tooltip_class)
				 .data([1]);

		return tip.enter() //in case we haven't created this before, do it now
				 	.append("div")
					.merge(tip)
					.classed(common.tooltip_class, true)
					.style("display", "none")
					.style("position", "absolute");
	};

	common.linechart_mouseover = function(container_id, produceHtmlFromD) {
		tip_id = "tip_for_" + container_id;
		tooltip = common.tooltip(tip_id);
		d3.selectAll("#" + container_id + " circle")
			.on("mouseover", function(d) {
				d3.select(this)
					.attr("stroke", "white")
					.attr("stroke-width", 3);

				tooltip.html(produceHtmlFromD(d))
						.style("display","block")
						.style("top", (d3.event.pageY + common.padding) + "px")
						.style("left", (d3.event.pageX + common.padding) + "px");
			})
			.on("mouseout",function(d) {
				var oldColor = d3.select(this).attr("fill");
				d3.select(this).attr("stroke", oldColor).attr("stroke-width", 1);
				d3.select("." + common.tooltip_class)
					.style("display","none");
			})
			;
		return tooltip;
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

	common.xBottom = function(container, xScale, transform) {
		var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0f"));

		//show x axis
		var xAxisGroup = container.append("g").classed("x-axis", true);
		xAxisGroup.call(xAxis);
		xAxisGroup.selectAll(".domain")
			.attr("stroke", common.colors.major_axes);

		xAxisGroup.selectAll(".tick text")
			.attr("class","axes")
			.attr("stroke", common.colors.major_axes);

		xAxisGroup.selectAll(".tick line")
			.attr("stroke", common.colors.minor_axes);

		xAxisGroup.attr("transform", transform);
	}

	common.yLeft = function(container, yScale, transform, width) {
		var yAxis = d3.axisLeft(yScale);

		//show Y axis
		var yAxisGroup = container.append("g").classed("y-axis", true);
		yAxisGroup.call(yAxis);
		yAxisGroup.selectAll(".domain")
			.attr("stroke", common.colors.major_axes);

		yAxisGroup.selectAll(".tick text")
			.attr("class","axes")
			.attr("stroke", common.colors.major_axes);

		yAxisGroup.selectAll(".tick line")
			.attr("stroke", common.colors.minor_axes)
			.attr("stroke-dasharray", "2,2")
			.attr("x2", width - common.margin.left - common.margin.right - common.padding * 2);
		yAxisGroup.attr("transform", transform);
	};

	this.common = common;
}();
