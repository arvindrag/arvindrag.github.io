// Basic setup
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

let nodes = [];
let links = [];

// Simulation setup with forces
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

// Drawing the links
let link = svg.append("g")
    .attr("class", "links")
    .selectAll("line");

// Drawing the nodes
let node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g");

// Update the graph
function update() {
    // Update links
    link = link.data(links);
    link.exit().remove();
    link = link.enter().append("g")
        .append("line")
        .attr("class", "link")
        .merge(link);

    // Update nodes
    node = node.data(nodes);
    node.exit().remove();

    const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("id", d => `node-${d.id}`) 
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    nodeEnter.append("circle")
        .attr("r", 10);

    nodeEnter.append("text")
        .attr("dy", -3)
        .text(d => d.id);

    node = nodeEnter.merge(node);

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
}

// Simulation tick function to update positions
function ticked() {
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node.attr("transform", d => `translate(${d.x},${d.y})`);
}

// Drag event handlers
function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// Function to add a new node
function addNode(id) {
    nodes.push({ id: id });
    update();
}

// Function to add a new edge (link)
function addEdge(sourceId, targetId) {
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    if (sourceNode && targetNode) {
        links.push({ source: sourceNode, target: targetNode });
        update();
    } else {
        console.error("Source or target node not found");
    }
}

function getTranslationFromD3(d3Element) {
  // Get the transform attribute from the D3 selection
  const transform = d3Element.attr("transform");

  // Use D3 string manipulation to extract the translate values
  const translate = transform.match(/translate\(([^)]+)\)/);

  if (translate) {
      const coords = translate[1].split(",");
      const x = parseFloat(coords[0]);
      const y = parseFloat(coords[1]);
      return { x, y };
  }

  return { x: 0, y: 0 };  // Default if no translation is found
}


function focusNode(id, duration = 200) {
  // const id="Historian"
  const nnode = d3.select(`#node-${id}`);
  const coods = getTranslationFromD3(nnode)
  if (!node.empty()) {
    // const cx = coods.x;
    // const cy = coods.y;

    const currentCenter = simulation.force("center").x();  // Get current center X (assuming it’s the same for Y)
    const currentCenterY = simulation.force("center").y();
    
    const interpolateX = d3.interpolate(currentCenter, coods.x);
    const interpolateY = d3.interpolate(currentCenterY, coods.y);
    // Update the center gradually over time
    const startTime = Date.now();
  
    d3.timer(function() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(1, elapsed / duration);
  
        // Update the center with interpolated values
        simulation.force("center", d3.forceCenter(interpolateX(t), interpolateY(t)));
  
        if (t === 1) return true; // Stop the timer once the transition is complete
    });
  }
}

