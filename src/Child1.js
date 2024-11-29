import React, { Component } from "react";
import * as d3 from "d3";
import './Child1.css';    //Child1 CSS

class Child1 extends Component{
  state = {
    model: ''
  }

  componentDidMount(){
    var data = this.props.csv_data
    //console.log(data)
    this.renderStackedChart()
  }

  componentDidUpdate(){
    var data = this.props.csv_data;
    //console.log(data)
    this.renderStackedChart()
  }

  renderStackedChart = () => {
    var data = this.props.csv_data;
    console.log(data)

    const maxSum = d3.sum([
      d3.max(data, d=>d.GPT4),
      d3.max(data, d=>d.Gemini),
      d3.max(data, d=>d.PaLM2),
      d3.max(data, d=>d.Claude),
      d3.max(data, d=>d.Llama3)
    ])
    console.log(maxSum)

    const margin = { top: 20, right: 90, bottom: 50, left: 50 },
      width = 700 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const x_scale = d3.scaleTime().domain(d3.extent(data, d=>d.Date)).range([margin.left, width]),
      y_scale = d3.scaleLinear().domain([0, maxSum]).range([height-margin.bottom, margin.bottom]),
      color_scale = d3.scaleOrdinal()
        .domain(['GPT4', 'Gemini', 'PaLM2', 'Claude', 'Llama3'])
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'])

    //create stack generator
    var stack = d3.stack().keys(['GPT4', 'Gemini', 'PaLM2', 'Claude', 'Llama3']).offset(d3.stackOffsetWiggle)
    var stackedSeries = stack(data)

    //create areaGen
    var areaGen = d3.area()
      .x((d)=>x_scale(d.data.Date))
      .y0((d)=>y_scale(d[0]))
      .y1((d)=>y_scale(d[1]))
      .curve(d3.curveCardinal)
    
    var container  = d3.select('.svg_parent')
      .attr('width', width+margin.left+margin.right)
      .attr('height', height+margin.top+margin.bottom)
    //var chartGroup = container.selectAll(".chart-group").data([null]).join("g").attr("class", "chart-group").attr("transform", `translate(${margin.left}, ${margin.top})`);
    container.selectAll('path').data(stackedSeries).join('path')
      .attr('see_data', d => console.log("show data",d))
      .attr('d', d => areaGen(d))
      .style('fill', d => color_scale(d.key))
      .on('mouseover', this.displayToolTip)
      .on('mouseleave', this.hideToolTip)
      .on('mousemove', this.updateTooltipLocation)

    //set X and Y axes
    if (data.length > 0) {
      container.selectAll(".x-axis").data([null]).join("g").attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x_scale).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b")));
      container.selectAll(".y-axis").data([null]).join("g").attr("class", "y-axis")
        .attr('transform', `translate(${margin.left},0)`)
        .style('opacity', 0)
        .call(d3.axisLeft(y_scale).ticks(5));
    }
    
    
    // Add legend
    const legend_data = ['GPT4', 'Gemini', 'PaLM2', 'Claude', 'Llama3'];
    if (data.length > 0) {
      const legend = container.selectAll(".legend").data(legend_data).join("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + margin.left}, ${height/2 + i * margin.top})`);
      
      legend.append("rect")
        .attr("width", margin.top)
        .attr("height", margin.top)
        .attr("fill", d => color_scale(d));

      legend.append("text")
        .attr("x", 25)
        .attr("y", 13)
        .style("text-anchor", "start")
        .style("font-size", "12px")
        .text(d => d);
      }

      
  }

  renderBarChart = (data) => {
    var margin = { top: 20, right: 20, bottom: 50, left: 50 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;
    
    var container = d3.select('.svg_bar')
      .attr('width', width+margin.left+margin.right)
      .attr('height', height+margin.top+margin.bottom)
    
    //X and Y scale
    var y_data = data.map(item=>item.data)
    var x_scale = d3.scaleBand().domain(data.map(d=>d.date)).range([margin.left,width]).padding(0.2)
    var y_scale = d3.scaleLinear().domain([0,d3.max(y_data)]).range([height, margin.bottom])
    var color_scale = d3.scaleOrdinal()
      .domain(['GPT4', 'Gemini', 'PaLM2', 'Claude', 'Llama3'])
      .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'])

    //setting X and Y Axes
    container.selectAll(".x_axis_g").data([0]).join('g').attr("class", "x_axis_g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x_scale).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b")))
    container.selectAll(".y_axis_g").data([0]).join('g').attr("class", "y_axis_g")
      .attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y_scale))
    
    //Creating the bar area
    container.selectAll('rect').data(data).join('rect')
      .attr('x', d=>x_scale(d.date))
      .attr('y', d=>y_scale(d.data))
      .attr('width', d=>x_scale.bandwidth())
      .attr('height', d=>height - y_scale(d.data))
      .attr('fill', d=>color_scale(d.model))
  }

  displayToolTip = (e,d) => {
    var model = d.key,
      data = this.props.csv_data,
      selected_data = data.map(item => {
        return {model: model, date: item.Date, data: item[model]}
      })
    var container = d3.select('.svg_bar').style('opacity',1)
    console.log(selected_data)
    this.renderBarChart(selected_data)
  }

  hideToolTip = (e,d) => {
    var container = d3.select('tooltip')
    var tooltip = d3.select('.svg_bar')
    tooltip.selectAll('rect').remove()
    tooltip.style('opacity',0)
  }

  updateTooltipLocation = (e,d) => {
    //console.log(e)
    d3.select('.tooltip').style('left', (e.x / 2 + 'px')).style('top', (e.y + 10 + 'px'))
  }

  render(){
    return(
      <div>
        <div className="tooltip"><svg className="svg_bar"></svg></div>
        <svg className="svg_parent"></svg>
      </div>
    );
  }
}

export default Child1;