// Set up the SVG canvas dimensions
const width = 800;
const height = 600;

// Create the SVG container for the graph
const svg = d3.select("#graph")
              .attr("width", width)
              .attr("height", height);

// Define the simulation for the force-directed layout
const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));

// Initial data for nodes and links
let nodes = [{ id: 1 }, { id: 2 }];
let links = [{ source: 1, target: 2 }];

// Create the initial links and nodes
const link = svg.append("g")
                .attr("class", "links")
              .selectAll("line")
              .data(links)
              .enter().append("line")
                .attr("class", "link");

const node = svg.append("g")
                .attr("class", "nodes")
              .selectAll("circle")
              .data(nodes)
              .enter().append("circle")
                .attr("class", "node")
                .attr("r", 10)
                .call(drag(simulation));

// Update the simulation with the initial data
simulation
    .nodes(nodes)
    .on("tick", ticked);

simulation.force("link")
    .links(links);

// Dragging behavior for nodes
function drag(simulation) {
  return d3.drag()
      .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
      })
      .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
      })
      .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
      });
}

// Function to update the positions of nodes and links
function ticked() {
  link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

  node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
}

// Function to add a new node and link dynamically
function addNode() {
  const newNode = { id: nodes.length + 1 };
  const targetNode = nodes[Math.floor(Math.random() * nodes.length)];
  nodes.push(newNode);
  links.push({ source: newNode.id, target: targetNode.id });

  // Update the nodes and links in the simulation
  updateGraph();
}

// Update the graph when nodes or links are added
function updateGraph() {
  // Update links
  const newLinks = svg.select(".links")
                      .selectAll("line")
                      .data(links);
  newLinks.enter()
          .append("line")
          .attr("class", "link");

  // Update nodes
  const newNodes = svg.select(".nodes")
                      .selectAll("circle")
                      .data(nodes);
  newNodes.enter()
          .append("circle")
          .attr("class", "node")
          .attr("r", 10)
          .call(drag(simulation));

  // Restart the simulation with the updated data
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(1).restart();
}

// Add a new node every 2 seconds (for demonstration purposes)
setInterval(addNode, 2000);
