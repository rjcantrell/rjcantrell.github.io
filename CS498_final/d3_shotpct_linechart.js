(function () {
  var retVal = { }

  var measure = 'Measure'
  var year = 'Year'
  var value = 'Value'
  var avg = 'avg'       // lame, I know.
  var min = 'min'       // But I boilerplated this hour-one while I thought about the project
  var max = 'max'       // not knowing if I was going to change my input file.

  var common = this.common
  var d3 = this.d3

  var maxcolor = common.colors.danger
  var mincolor = common.colors.success
  var avgcolor = common.colors.warning

  function initialize (svgContainerID, width, height) {
    d3.csv('shotpct_team_by_year_summary.csv', function (error, data) {
      if (error) { throw error }
      update(data, svgContainerID, width, height)
    })

    d3.select('div#' + svgContainerID)
        .append('div')
        .classed('annotation1', true)
        .attr('id', 'teamshots_annotation1')
        .attr('data-original-title', '1974')
        .attr('data-content', 'The first modern "cage" style goalie masks are introduced, and the last goalie to play without a mask retires')
        .attr('data-placement', 'bottom')
        .text(' ')
        // you can't position the popover here, because it's not THIS that actually displays
        // the popover. The visual page element is dropped in as a sibling with a
        // random ID number, so I don't know a better way to select it than as a sibling.
        // you can't style the visual element before the button is clicked, as it
        // does not exist in the DOM beforehand.

    d3.select('div#' + svgContainerID)
        .append('div')
        .classed('annotation2', true)
        .attr('id', 'teamshots_annotation2')
        .attr('data-original-title', '1986')
        .attr('data-content', 'Patrick Roy popularizes "butterfly" style goaltending, winning the Stanley Cup as a rookie. It remains the dominant style today. Goalies also start wearing grotesquely-large shoulder and leg pads')
        .attr('data-placement', 'bottom')
        .text(' ')

    d3.select('div#' + svgContainerID)
        .append('div')
        .classed('annotation3', true)
        .attr('id', 'teamshots_annotation3')
        .attr('data-original-title', '2006')
        .attr('data-content', 'During the lockout year, the NHL develops new rules to increase scoring. These include restrictions on maximum goalie pad size, legalization of the "two-line pass", and a prohibition on goalies playing the puck in the corners of the rink')
        .attr('data-placement', 'top')
        .text(' ')
  }

  function update (data, svgContainerID, width, height) {
    // separate avg, min, and max series for separate plotting
    var maxes = data.filter(function (row) { return row[measure] === max })
    var mins = data.filter(function (row) { return row[measure] === min })
    var avgs = data.filter(function (row) { return row[measure] === avg })

    // create scales used to display line-chart points
    var xScale = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return +d[year] }),
                 d3.max(data, function (d) { return +d[year] })])
        .range([common.margin.left, width - (common.margin.left + common.margin.right)])

    var yScale = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return +d[value] }),
                 d3.max(data, function (d) { return +d[value] })])
        .range([height, common.margin.top]) // SVG coords are backwards

    // line-maker function
    var lineGen = common.lineGen.bind(this, xScale, yScale, year, value)()

    // create SVG elements
    var svg = d3.select('div#' + svgContainerID)
        .append('svg')
        .attr('width', width + common.margin.left + common.margin.right)
        .attr('height', height + common.margin.top + common.margin.bottom)
        .classed('home', true)

    // label axes
    svg.append('text')
        .classed('y-label', true)
        .attr('text-anchor', 'end')
        .attr('fill', common.colors.major_axes)
        .attr('y', 0)
        .attr('x', height / 4 * -1)
        .attr('dy', '.75em')
        .attr('transform', 'rotate(-90)')
        .text('Shot Percentage: Goals / Shots Attempted')

    var axes = svg.append('g').classed(common.group_axes, true)
    common.xBottom(axes, xScale, 'translate(0,' + height + ')')
    common.yLeft(axes, yScale, 'translate(' + common.margin.left + ',0)', width)

    // max line
    svg.append('g').classed('max_line', true).append('svg:path')
        .attr('d', lineGen(maxes))
        .attr('stroke', maxcolor)
        .attr('stroke-width', 2)
        .attr('fill', 'none')

    // min line
    svg.append('g').classed('min_line', true).append('svg:path')
        .attr('d', lineGen(mins))
        .attr('stroke', mincolor)
        .attr('stroke-width', 2)
        .attr('fill', 'none')

    // avg line
    svg.append('g').classed('avg_line', true).append('svg:path')
        .attr('d', lineGen(avgs))
        .attr('stroke', avgcolor)
        .attr('stroke-width', 2)
        .attr('fill', 'none')

    // max datapoints
    svg.append('g').classed('maxes', true).selectAll('.' + max)
        .data(maxes)
        .enter()
        .append('circle')
        .merge(svg)
        .classed(max, true)
        .attr('cx', function (d) { return xScale(d[year]) })
        .attr('cy', function (d) { return yScale(d[value]) })
        .attr('fill', maxcolor)
        .attr('r', '5')

    // min datapoints
    svg.append('g').classed('mins', true).selectAll('.' + min)
        .data(mins)
        .enter()
        .append('circle')
        .merge(svg)
        .classed(min, true)
        .attr('cx', function (d) { return xScale(d[year]) })
        .attr('cy', function (d) { return yScale(d[value]) })
        .attr('fill', mincolor)
        .attr('r', '5')

    // avg datapoints
    svg.append('g').classed('avgs', true).selectAll('.' + avg)
        .data(avgs)
        .enter()
        .append('circle')
        .merge(svg)
        .classed(avg, true)
        .attr('cx', function (d) { return xScale(d[year]) })
        .attr('cy', function (d) { return yScale(d[value]) })
        .attr('fill', avgcolor)
        .attr('r', '5')

    common.linechart_mouseover('teamshots', function (d) {
      return '<div>' +
                '<div class="m-col-7"><strong>Year:</strong></div>' +
                '<div class="m-col-5">' + d[year] + '</div>' +
            '</div><br/>' +
            '<div>' +
                '<div class="m-col-7"><strong>Shot %:</strong></div>' +
                '<div class="m-col-5">' + parseFloat(d[value]).toFixed(2) + '</div>' +
            '</div>'
    })
  }

  retVal.draw = initialize

  this.teamshots_linechart = retVal
})()
