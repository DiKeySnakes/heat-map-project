let baseTemp;
let values = [];

let xScale;
let yScale;

const width = 1200;
const height = 600;
const padding = 60;

const svg = d3.select('svg');
const tooltip = d3.select('#tooltip');

const generateScales = () => {
  const minYear = d3.min(values, (item) => {
    return item['year'];
  });

  const maxYear = d3.max(values, (item) => {
    return item['year'];
  });

  xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear + 1])
    .range([padding, width - padding]);

  yScale = d3
    .scaleTime()
    .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
    .range([padding, height - padding]);
};

const createSvg = () => {
  svg.attr('width', width);
  svg.attr('height', height);
};

const createCells = () => {
  const tooltip = d3.select('body').append('div').attr('id', 'tooltip');
  svg
    .selectAll('rect')
    .data(values)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('fill', (item) => {
      const variance = item['variance'];
      if (variance <= -1) {
        return 'rgba(83, 158, 208, 1)';
      } else if (variance <= 0) {
        return 'rgba(202, 173, 114, 1)';
      } else if (variance <= 1) {
        return 'rgba(255, 225, 0, 1)';
      } else {
        return 'rgba(255, 145, 0, 1)';
      }
    })
    .attr('data-year', (item) => {
      return item['year'];
    })
    .attr('data-month', (item) => {
      return item['month'] - 1;
    })
    .attr('data-temp', (item) => {
      return baseTemp + item['variance'];
    })
    .attr('height', (item) => {
      return (height - 2 * padding) / 12;
    })
    .attr('y', (item) => {
      return yScale(new Date(0, item['month'] - 1, 0, 0, 0, 0, 0));
    })
    .attr('width', (item) => {
      const minYear = d3.min(values, (item) => {
        return item['year'];
      });

      const maxYear = d3.max(values, (item) => {
        return item['year'];
      });

      const yearCount = maxYear - minYear;

      return (width - 2 * padding) / yearCount;
    })
    .attr('x', (item) => {
      return xScale(item['year']);
    })
    .on('mouseover', (e) => {
      const target = e.target;
      tooltip.transition().style('visibility', 'visible');
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      tooltip.text(
        `${target.dataset.year}, ${monthNames[target.dataset.month - 1]} : ${
          target.dataset.temp
        }`
      );
      tooltip.attr('data-year', target.dataset.year);
    })
    .on('mouseout', () => {
      tooltip.transition().style('visibility', 'hidden');
    });
};

const generateAxes = () => {
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%B'));

  svg
    .append('g')
    .call(xAxis)
    .attr('id', 'x-axis')
    .attr('transform', 'translate(0, ' + (height - padding) + ')');

  svg
    .append('g')
    .call(yAxis)
    .attr('id', 'y-axis')
    .attr('transform', 'translate(' + padding + ', 0)');
};

const url =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const req = new XMLHttpRequest();

req.open('GET', url, true);
req.send();
req.onload = () => {
  const data = JSON.parse(req.responseText);
  baseTemp = data.baseTemperature;
  values = data.monthlyVariance;
  createSvg();
  generateScales();
  createCells();
  generateAxes();
};
