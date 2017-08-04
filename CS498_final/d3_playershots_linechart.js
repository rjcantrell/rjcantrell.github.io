!(function () {
  var retVal = { }
  var common = this.common
  var d3 = this.d3

  // not part of "stats" because while they're in the file,
  // we don't allow user choice on how to use these
  var age = 'age'
  var pos = 'position'
  var recordCount = 'record_count'

  // HTML div IDs in which we want to add data-driven controls
  var panelRadio = 'playershots_statpanel'
  var panelChecks = 'playershots_positionpanel'

  var stats = {
    'avg_shotpct': 'Shot Percentage',
    'avg_plus_minus': 'Plus/Minus',
    'avg_goals': 'Goals',
    'avg_shot': 'Shots Taken'
  }

  var skaterData = {
    lw: [],
    rw: [],
    c: [],
    d: []
  }

  var chartData = {
    height: 0,
    width: 0,
    svgContainerID: ''
  }

  // how long should all transitions on the page take?
  var transTime = d3.transition().duration(750)

  function initialize (svgContainerID, width, height) {
    d3.csv('skater_stats_summary.csv', function (error, data) {
      if (error) { throw error }

      for (var p in common.positions) {
        skaterData[p] = data.filter(function (row) { return row[pos] === common.positions[p] })
      }

      chartData['svgContainerID'] = svgContainerID
      chartData['width'] = width
      chartData['height'] = height

      build()
      update()
    })
  }

  function build () {
    var container = d3.select('div#' + chartData['svgContainerID'])

    // create SVG elements
    container.append('svg')
        .attr('width', chartData['width'] + common.margin.left + common.margin.right)
        .attr('height', chartData['height'] + common.margin.top + common.margin.bottom)
        .classed('home', true)

    /* Burn down through D3 to get the underlying JS impl of DOM nodes
    if (!checkPanel.empty()) {
    checkPanel              // the d3 selection we just made
    .nodes()                // the nodes from the selection
    [0]                     // the first in the array. a regular ol' JS {Object}.
    .parentNode             // traverse the DOM one upward
    .classList              // preferred way as of es6, I think?
    .remove("invisible");   // FINALLY. */

    // radio buttons for available stats
    var radioPanel = d3.select('div#' + panelRadio)
    if (!radioPanel.empty()) {
      radioPanel.nodes()[0].parentNode.classList.remove('invisible')
    }

    var haveCheckedOne = false
    for (var s in stats) {
      var radioRow = radioPanel.append('div')
        .classed('row', true)

      radioRow.append('input')
        .attr('type', 'radio')
        .classed('padded', true)
        .attr('style', 'margin-left: 15px')
        .attr('name', 'stats_group')
        .attr('id', s)
        .property('checked', function () {
          if (!haveCheckedOne) {
            haveCheckedOne = true
            return true
          }
          return false
        })
        .on('change', function () { update() })

      radioRow.append('label')
        .attr('for', s)
        .text(stats[s])
    }

    // checkboxes for positions displayed (in #playershots_positionpanel)
    var checkPanel = d3.select('div#' + panelChecks)
    if (!checkPanel.empty()) {
      checkPanel.nodes()[0].parentNode.classList.remove('invisible')
    }

    for (var p in common.positions) {
      var checkRow = checkPanel.append('div')
        .classed('row', true)

      checkRow.append('input')
        .attr('type', 'checkbox')
        .classed('padded', true)
        .attr('style', 'margin-left: 15px') // Should this be in CSS? Am I a bad person?
        .attr('checked', true)
        .attr('id', p)
        .on('change', function () { update() })

      checkRow.append('label')
        .attr('for', p)
        .text(common.positions[p])
    }
  }

  // doesn't need parameters since it can ask the checkboxes which data to show
  function update () {
    var data = []

    // decide which stat to plot
    // shouldn't need to check for empty, since the whole point of radio buttons
    // is that one, and only one, will be selected
    var selectedRadio = d3.selectAll('div#' + panelRadio + ' input')
        .filter(function () { return this.checked === true })
        .nodes()[0]

    var statToPlot = selectedRadio.id

    // decide which players' data to plot based on which checkboxes are checked
    var checks = d3.selectAll('div#' + panelChecks + ' input')
        .filter(function () { return this.checked === true })
        .nodes()

    // build a dataset from positions' component datasets
    checks.forEach(function (e) { data = data.concat(skaterData[e.id]) })

    // remove unnecessary fields, calculate average-of-averages for positions chosen
    data = getPlottableSeriesByAge(data, statToPlot)

    // create scales used to display line-chart points
    var xScale = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return +d[age] }),
                 d3.max(data, function (d) { return +d[age] })])
        .range([common.margin.left, chartData['width'] - (common.margin.left + common.margin.right)])

    var yScale = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return +d[statToPlot] }),
                 d3.max(data, function (d) { return +d[statToPlot] })])
        .range([chartData['height'], common.margin.top])// SVG coords are backwards

    var svg = d3.select('div#' + chartData['svgContainerID'] + ' svg')

    // let's remove and re-add axes, even if we're going to animate the data
    svg.select('g.' + common.group_axes).remove()
    var axes = svg.append('g').classed('axes', true)
    common.xBottom(axes, xScale, 'translate(0,' + chartData['height'] + ')')
    common.yLeft(axes, yScale, 'translate(' + common.margin.left + ',0)', chartData['width'])

    // line-maker function
    var lineGen = common.lineGen.bind(this, xScale, yScale, age, statToPlot)()

    // dataset line
    var line = svg.selectAll('path.statline')
        .data(data)

    // we'll only have an exit to fade out if we choose a plotting that has a
    // different number of datapoints than our old line.exit()
    line.exit()
        .style('opacity', 1e-6)
        .remove()

    line = line.enter()
        .append('svg:path') // if this gets inserted once, we shouldn't have an enter afterward
            .classed('statline', true)
            .attr('opacity', 1e-6)
        .merge(line)
            .attr('stroke', common.colors.success)
            .attr('stroke-width', 2)
            .attr('fill', 'none')
        .transition(transTime)
            .attr('opacity', 1)
            .attr('d', lineGen(data))

    // dataset points
    var points = svg.selectAll('circle')
        .data(data)

    // fade out old points not in the new selection
    points.exit()
        .transition(transTime)
        .style('fill-opacity', 1e-6)
        .remove()

    // fade in new points
    points.enter()
        .append('circle')
        .merge(points) // everything below applies to enter + update
        .classed(statToPlot, true)
        .attr('fill', common.colors.success)
        .attr('r', '5')
        .transition(transTime)
            .attr('cx', function (d) { return xScale(d[age]) })
            .attr('cy', function (d) { return yScale(d[statToPlot]) })

    common.linechart_mouseover(chartData['svgContainerID'], function (d) {
      return '<div>' +
                '<div class="m-col-7"><strong>Age:</strong></div>' +
                '<div class="m-col-5">' + d[age] + '</div>' +
            '</div><br/>' +
            '<div>' +
                '<div class="m-col-7"><strong>Value:</strong></div>' +
                '<div class="m-col-5">' + parseFloat(d[statToPlot]).toFixed(2) + '</div>' +
            '</div>'
    })
  }

  function getPlottableSeriesByAge (data, columnName) {
    retVal = []

    var ages = new Set(data.map(function (d) { return +d[age] }))

    ages.forEach(function (a) { // probably a more functional way to do this...
      // get every row for this age
      var rows = data.filter(function (d) { return parseInt(d[age]) === parseInt(a) })

      // get all instances of this stat (an avg) for this age, multiplied by
      // the record count that made that average, to make "raw data" from which to average
      var stats = rows.map(function (d) {
        return { 'count': +d[recordCount], 'raw_stat': +d[columnName] * +d[recordCount] }
      })

      var total = stats.map(function (d) { return +d['raw_stat'] }).reduce((a, b) => a + b, 0)
      var count = stats.map(function (d) { return +d['count'] }).reduce((a, b) => a + b, 0)

      var datum = { age: a }
      datum[columnName] = total / count // dislike how you can't use a var for column name inline
      retVal.push(datum)
    })

    return retVal
  }

  retVal.draw = initialize
  retVal.update = update

  this.playershots_linechart = retVal
}())
