var d3 = require('d3');

function getMaxFunction(prop1, prop2) {
  return function(d) {
    return d3.max([d[prop1], d[prop2]]);
  }
}

function getYear(prop) {
  if (prop.indexOf('2015') != -1) {
   return 2015;
  }

  return 2014;
}

function render(container, data, prop1, prop2) {
  prop1 = prop1 || 'synthetic_opioids_2014_rate';
  prop2 = prop2 || 'synthetic_opioids_2015_rate';

  // Empty the container
  container.selectAll('*').remove();

  var margin = {top: 20, right: 10, bottom: 50, left: 100};
  var circleRadius = 4;
  var lineStroke = 3;

  var bbox = container.node().getBoundingClientRect();
  var width = bbox.width - margin.left - margin.right;
  var height = bbox.height - margin.top - margin.bottom;

  var xMax = d3.max(data, getMaxFunction(prop1, prop2));
  var xScale = d3.scaleLinear()
    .domain([0, xMax])
    .range([0, width])
    .nice();

  var yScale = d3.scalePoint()
    .domain(data.map(function(d) { return d.state }))
    .range([0, height])
    .padding(0.5);

  var fillColorScale = d3.scaleOrdinal()
    .domain([2014, 2015])
    .range(['white', 'red']);

  var strokeColorScale = d3.scaleOrdinal()
    .domain([2014, 2015])
    .range(['red', 'red']);

  var xAxis = d3.axisBottom(xScale);

  var yAxis = d3.axisLeft(yScale)
    // Suppress ticks.
    // They're chart junk
    .tickSize(0)
    .tickSizeOuter(0);

  var svg = container.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top  + ')');

  var line = d3.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; });

  var lines = svg.append('g')
      .attr('class', 'lines')
    .selectAll('.line')
      .data(data)
    .enter().append('path')
      .attr('class', 'line')
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", lineStroke)
      .datum(function(d) {
        return [
          [xScale(d[prop1]), yScale(d.state)],
          [xScale(d[prop2]), yScale(d.state)],
        ];
      })
      .attr('d', line);


  // 2014
  var prop1Dots = svg.append('g')
      .attr('class', 'dots', 'dots--prop1')
    .selectAll('.dot')
      .data(data)
    .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', circleRadius)
      .attr('cx', function(d) { return xScale(d[prop1]); })
      .attr('cy', function(d) { return yScale(d.state); })
      .attr('fill', function(d) { return fillColorScale(getYear(prop1)); })
      .attr('stroke', function(d) { return strokeColorScale(getYear(prop1)); });

  // 2015
  var prop1Dots = svg.append('g')
      .attr('class', 'dots', 'dots--prop2')
    .selectAll('.dot')
      .data(data)
    .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', circleRadius)
      .attr('cx', function(d) { return xScale(d[prop2]); })
      .attr('cy', function(d) { return yScale(d.state); })
      .attr('fill', function(d) { return fillColorScale(getYear(prop2)); })
      .attr('stroke', function(d) { return strokeColorScale(getYear(prop2)); });

  svg.append('g')
    .attr('transform', 'translate(' + -5 + ',' + 0 + ')')
    .attr('class', 'axis axis--y')
    .call(yAxis);

  svg.select('.axis--y .domain').remove();

  svg.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(' + 0 + ',' + height + ')')
    .call(xAxis);

  svg.append('g')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height + 40) + ')')
      .attr('class', 'axis-label axis-label--x')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
    .append('text')
      .text("Overdose deaths per 100,000 people");

  // Add a legend
  var legend = svg.append('g')
      .attr('class', 'legend')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10);

  legend.append('circle')
      .attr('r', circleRadius)
      .attr('fill', function(d) { return fillColorScale(getYear(prop1)); })
      .attr('stroke', function(d) { return strokeColorScale(getYear(prop1)); });

  legend.append('text')
      .attr('x', circleRadius * 2)
      .attr('class', 'legend__label')
      .attr('fill', '#000')
      .text(getYear(prop1))
      .attr('alignment-baseline', 'central');

  // HACK: very hard-coded legend label positioning
  var start2015 = ((circleRadius * 2) + 50);
  legend.append('circle')
      .attr('r', circleRadius)
      .attr('cx', start2015)
      .attr('fill', function(d) { return fillColorScale(getYear(prop2)); })
      .attr('stroke', function(d) { return strokeColorScale(getYear(prop2)); });

  legend.append('text')
      .attr('x', (start2015 + (circleRadius * 2)))
      .attr('class', 'legend__label')
      .attr('fill', '#000')
      .text(getYear(prop2))
      .attr('alignment-baseline', 'central');

  // Center the legend
  // HACK: Lots of hard coding here
  var legendBBox = legend.node().getBBox();
  var legendX = (((width) / 2) - (legendBBox.width / 2));
  legend.attr('transform', 'translate(' + legendX  + ',' + -10 + ')');
}

function cleanData(d) {
  return {
    heroin_2014_count: parseInt(d.heroin_2015_count),
    heroin_2014_rate: parseFloat(d.heroin_2015_rate),
    heroin_2015_count: parseInt(d.heroin_2015_count),
    heroin_2015_rate: parseFloat(d.heroin_2015_rate),
    heroin_rate_pct_change_2014_2015: parseFloat(d.heroin_rate_pct_change_2014_2015),
    state: d.state,
    synthetic_opioids_2014_count: parseInt(d.synthetic_opioids_2014_count),
    synthetic_opioids_2014_rate: parseFloat(d.synthetic_opioids_2014_rate),
    synthetic_opioids_2015_count: parseInt(d.synthetic_opioids_2015_count),
    synthetic_opioids_2015_rate: parseFloat(d.synthetic_opioids_2015_rate),
    synthetic_opioids_rate_pct_change_2014_2015: parseFloat(d.synthetic_opioids_rate_pct_change_2014_2015)
  };
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function getCompareFunction(prop) {
  return function(a, b) {
    // Sort descending

    // Make sure null values always go at the end
    if (isNaN(a[prop])) {
      return 1;
    }

    if (isNaN(b[prop])) {
      return -1;
    }

    return b[prop] - a[prop];
  };
}

function getRemoveRatelessFunc(prop) {
  return function(d) {
    return !isNaN(d[prop]);
  };
}


function OpioidDeathsViz(container) {
  d3.csv('data/overdose_deaths__synthetic_opiods_and_heroin__viz.csv', function(data) {
    var dataClean = data.map(cleanData)
      .sort(getCompareFunction('synthetic_opioids_rate_pct_change_2014_2015'))
      .filter(getRemoveRatelessFunc('synthetic_opioids_rate_pct_change_2014_2015'));
    d3.select(container).call(render, dataClean);

    var resize = debounce(function() {
      d3.select(container).call(render, dataClean);
    });

    window.addEventListener('resize', resize);
  });
}

module.exports = OpioidDeathsViz;
