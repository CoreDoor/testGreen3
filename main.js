import './styles.css'

import {
  select,
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceX,
  forceY,
  drag,
  csv,
  stratify,
  hierarchy,
  selectAll,
  zoom,
  zoomIdentity,
  //node,
  range,
  schemeCategory10,
  json,
  //transform,

} from 'd3';


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//Herman Sontrop | Force Layout |canvas| json | d3v7 | drag/zoom
//https://gist.github.com/FrissAnalytics


// Force layout on canvas with zoom/pan and drag
// https://gist.github.com/FrissAnalytics/e31cc912cc0c512ec06436087844b523
// From D3v4 Block

const radius = 5;

const defaultNodeCol = "white",
  highlightCol = "yellow";

const height = window.innerHeight;
const graphWidth = window.innerWidth;

const graphCanvas = select('#graphDiv').append('canvas')
  .attr('width', graphWidth + 'px')
  .attr('height', height + 'px')
  .node();

const context = graphCanvas.getContext('2d');

const div = select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


const simulation = forceSimulation()
  .force("center", forceCenter(graphWidth / 2, height / 2))
  .force("x", forceX(graphWidth / 2).strength(0.1))
  .force("y", forceY(height / 2).strength(0.1))
  .force("charge", forceManyBody().strength(-50))
  .force("link", forceLink().strength(1).id(function (d) { return d.id; }))
  .alphaTarget(0)
  .alphaDecay(0.05)

let transform = zoomIdentity;//cannot be declared as const


// Get the data from our CSV file - D3v6
//csv('data.csv')
json('HS_data.json')//nodes: id | edges: source, target

  .then(function (data) {
    // data is now whole data set
    //vData = stratify()(vData);
    // draw chart in here!



    drawViz(data);
  })
  .catch(function (error) {
    // handle error  
    if (error) throw error;
  })


//json("HS_data.json", function (error, data) {//D3v4




function drawViz(data) {

  initGraph(data)

  function initGraph(tempData) {


    function zoomed(event) {
      console.log("zooming")
      transform = event.transform;
      simulationUpdate();
    }

    select(graphCanvas)
      .call(drag().subject(dragsubject).on("start", dragstarted).on("drag", dragged).on("end", dragended))
      .call(zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))



    function dragsubject(event) {

      console.log("dragsubject start")
      let i,
        x = transform.invertX(event.x),
        y = transform.invertY(event.y),
        dx,
        dy;
      for (i = tempData.nodes.length - 1; i >= 0; --i) {
        const node = tempData.nodes[i];//define node here as const
        dx = x - node.x;
        dy = y - node.y;

        if (dx * dx + dy * dy < radius * radius) {

          node.x = transform.applyX(node.x);
          node.y = transform.applyY(node.y);

          console.log(node)

          return node;
        }
      }

      console.log("dragsubject start +")
    }


    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = transform.invertX(event.x);
      event.subject.fy = transform.invertY(event.y);
    }

    function dragged(event) {
      event.subject.fx = transform.invertX(event.x);
      event.subject.fy = transform.invertY(event.y);

    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    simulation.nodes(tempData.nodes)
      .on("tick", simulationUpdate);

    simulation.force("link")
      .links(tempData.edges);

    function simulationUpdate() {
      context.save();

      context.clearRect(0, 0, graphWidth, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      tempData.edges.forEach(function (d) {
        context.beginPath();
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
        context.stroke();
      });

      // Draw the nodes
      tempData.nodes.forEach(function (d, i) {

        context.beginPath();
        context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
        context.fillStyle = d.col ? "red" : "black"
        context.fill();
      });

      context.restore();


    }//ends simulationUpdate function
  }//ends initGraph function
}//ends drawViz function

