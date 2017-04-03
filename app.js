var ds = deepstream('wss://154.deepstreamhub.com?apiKey=97a397bd-ccd2-498f-a520-aacc9f67373c');
var client = ds.login();
var data = [
  {name: 'WH', votes: 37},
  {name: 'KR', votes: 59},
  {name: 'AH', votes: null},
  {name: 'JM', votes: 86},
  {name: 'AF', votes: 44},
];

var margin = { top: 10, right: 10, bottom: 30, left: 30 };
var width = 400 - margin.left - margin.right;
var height = 535 - margin.top - margin.bottom;

var svg = d3.select('.chart')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .call(responsivefy)
  .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

var xScale = d3.scaleBand()
  .domain(data.map(d => d.name))
  .range([0, width])
  .padding(0.2);
svg
  .append('g')
  .attr('class', 'line')
  .attr('transform', `translate(0, ${height})`)
  .call(d3.axisBottom(xScale));

var yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([height, 0])
  .clamp(true);
svg
  .append('g')
  .attr('class', 'line')
  .call(d3.axisLeft(yScale));

function render (subject = 'votes', data) {
  var t = d3.transition().duration(1000);

  var update = svg.selectAll('rect')
    .data(data.filter(d => d[subject]), d => d.name);

  update.exit()
    .transition(t)
    .attr('y', height)
    .attr('height', 0)
    .remove();

  update
    .transition(t)
    .attr('y', d => yScale(d[subject]))
    .attr('height', d => height - yScale(d[subject]));

  var gradient = svg.append("defs")
    .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

  gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#2FA2F3")
      .attr("stop-opacity", .5);

  gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#09388E")
      .attr("stop-opacity", .8);

  update
    .enter()
    .append('rect')
    .attr('y', height)
    .attr('height', 0)
    .attr('x', d => xScale(d.name))
    .attr('width', d => xScale.bandwidth())
    .style("fill", "url(#gradient)")
    .transition(t)
    .attr('y', d => yScale(d[subject]))
    .attr('height', d => height - yScale(d[subject]));
}

render('votes', data);

client.event.subscribe('vote', function(val) {
  data = data.map(d => {
    if(d.name === val) {
      return Object.assign({}, d, {votes: d.votes += 10})
    }
    return d;
  })

  console.log(data);

  render('votes', data);
})

d3.selectAll('input')
.on('change', handleChange)

function handleChange() {
  var val = this.value;

  client.event.emit('vote', val)
  
}

function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMid")
      .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
  }
}
