// https://observablehq.com/@danielefadda/sankey-with-plotly@740
import define1 from "https://raw.githubusercontent.com/gtaddia/sankeyjs/main/e93997d5089d7165%402303.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Sankey with plotly`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`reference: 
1. https://plot.ly/javascript/sankey-diagram/
2. https://plot.ly/~alishobeiri/1591/plotly-sankey-diagrams/#/`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Data preparation`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Load Data`
)});
  main.variable(observer("viewof raw_data")).define("viewof raw_data", ["html"], function(html){return(
html`<input type=file accept='text'>`
)});
  main.variable(observer("raw_data")).define("raw_data", ["Generators", "viewof raw_data"], (G, _) => G.input(_));
  main.variable(observer("psv")).define("psv", ["d3"], function(d3){return(
d3.dsvFormat(";")
)});
  main.variable(observer("data")).define("data", ["d3","psv"], function(d3,psv){return(
d3.text('https://raw.githubusercontent.com/rinziv/DVVA-2019/master/data_observable/dati_grafo.dsv').then(
  (txt) => psv.parse(txt))
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Create a filtered version of nodes ( >=filterNumber )`
)});
  main.variable(observer("nodesToFilter")).define("nodesToFilter", ["d3","data","filterNumber"], function(d3,data,filterNumber)
{
  const sourceNode = d3.nest()
  .key(d => d.organization_citing)
  .rollup(v => v.length)
  .entries(data)
  .map(function(group) {
    return {
      name: group.key,
      count: group.value,
      type: 'source'
    }
  }) 
    const targetNode = d3.nest()
  .key(d => d.university_cited)
  .rollup(v => v.length)
  .entries(data)
  .map(function(group) {
    return {
      name: group.key,
      count: group.value,
      type: 'target'
    }
  })
    
    
   const allNodes= sourceNode.concat(targetNode).filter(d => d.count >= filterNumber).map(d=>d.name)
   return allNodes
}
);
  main.variable(observer("filteredData")).define("filteredData", ["data","nodesToFilter"], function(data,nodesToFilter){return(
data.filter(d=> nodesToFilter.indexOf(d.organization_citing) >= 0 && nodesToFilter.indexOf(d.university_cited) >= 0 )
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Function to get the list of unique nodes`
)});
  main.variable(observer("nodes")).define("nodes", function(){return(
(data,source,target) => {
  const sourceNodes  = Array.from(new Set(data.map(d=>d[source])));
  const targetNodes = Array.from(new Set(data.map(d=>d[target]))); 
  const nodes = sourceNodes.concat(targetNodes)
  return nodes
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Function to *Group by* organization and university`
)});
  main.variable(observer("gData")).define("gData", ["d3"], function(d3){return(
(data,source,target) => {
  const gData = d3.nest()
  .key(d => d[source])
  .key(d => d[target])
  .rollup(v => v.length)
  .entries(data)
  return gData
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Function to create edges list from Data`
)});
  main.variable(observer("edgeList")).define("edgeList", function(){return(
(gby_data,nodeList) => {
  let edgeList=[];
  gby_data.forEach(function(el){
    el.values.forEach(function (v,i){
      const edge = {};
      // create the edge object
      edge.source=nodeList.indexOf(el.key)
      edge.target=nodeList.indexOf(v.key)
      edge.value=v.value
      // following attributes are optional
      edge.sourceName=el.key
      edge.targetName=v.key
      // append to the edge list
      edgeList.push(edge)
    })
  })
  return edgeList;
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Function to filter edges list`
)});
  main.variable(observer("filteredLinks")).define("filteredLinks", ["minEdges"], function(minEdges){return(
(data) => {
  return data.filter(d => d.value >= minEdges)
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Aggregate all functions to get Sankey Data`
)});
  main.variable(observer("sankeyData")).define("sankeyData", ["nodes","gData","edgeList","filteredLinks"], function(nodes,gData,edgeList,filteredLinks){return(
(data,source,target) => {
  const nodeList = nodes(data,source,target);
  const gby = gData(data,source,target);
  const edges = edgeList(gby,nodeList);
  const filteredEdges = filteredLinks(edges) //control this value with slider below
  return {
    nodes:nodeList,
    edges:filteredEdges
  }
}
)});
  main.variable(observer("sankey")).define("sankey", ["DOM","h","width","Plotly"], function(DOM,h,width,Plotly){return(
(sankeyData, title, nodeColor,orientation,height ) => {
  const trace = {
    type: "sankey",
    orientation: orientation,
    valueformat: ".0f",
   node: {
      pad: 5,
      thickness: 15,
      line: {
        color: nodeColor,
        width: 0.5
      }, 
      color: nodeColor,
      label: sankeyData['nodes'],
     
   },
    link: {
        source: sankeyData['edges'].map(d => d.source), 
        target: sankeyData['edges'].map(d => d.target),
        value: sankeyData['edges'].map(d => d.value)
      }    
  };
  
  const data=[trace];
  
  const div = DOM.element('div');
  
  const layout = {
    title: title,
    font: {
      size: 10
    },
    height:h,
    width:width
    
  };
  
  Plotly.react(div, data, layout);
  return div;
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Apply functions:`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`pass your Data values to *sankeyData* Function to reshape your dataset and visualize it with a sankey diagram: 

sankeyData(data,source,target)

1. *data* = your data (choose between *data* or *filteredData* version)
2. *source* = the name of the column with source data
3. *target* = the name of the column with target data
`
)});
  main.variable(observer("sd")).define("sd", ["sankeyData","filteredData"], function(sankeyData,filteredData){return(
sankeyData(filteredData,'organization_citing','university_cited')
)});
  main.variable(observer("viewof minEdges")).define("viewof minEdges", ["slider"], function(slider){return(
slider({
  min: 1, 
  max: 10, 
  step: 1, 
  value: 5, 
  title: "Minimum edges value to visualize"
})
)});
  main.variable(observer("minEdges")).define("minEdges", ["Generators", "viewof minEdges"], (G, _) => G.input(_));
  main.variable(observer("viewof filterNumber")).define("viewof filterNumber", ["slider"], function(slider){return(
slider({
  min: 1, 
  max: 100, 
  step: 1, 
  value: 20, 
  title: "Minimum node size to visualize"
})
)});
  main.variable(observer("filterNumber")).define("filterNumber", ["Generators", "viewof filterNumber"], (G, _) => G.input(_));
  main.variable(observer("sankeyChart")).define("sankeyChart", ["sankey","sd"], function(sankey,sd){return(
sankey(sd,"Organizations linked to universities","red","h",700)
)});
  main.variable(observer("viewof h")).define("viewof h", ["slider"], function(slider){return(
slider({
  min: 300, 
  max: 1200, 
  step: 1, 
  value: 700, 
  title: "Set Height of the graph"
})
)});
  main.variable(observer("h")).define("h", ["Generators", "viewof h"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`## Visualize Data`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# APPENDIX`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  main.variable(observer("Plotly")).define("Plotly", ["require"], function(require){return(
require('https://cdn.plot.ly/plotly-latest.min.js')
)});
  const child1 = runtime.module(define1);
  main.import("select", child1);
  const child2 = runtime.module(define1);
  main.import("slider", child2);
  const child3 = runtime.module(define1);
  main.import("autoSelect", child3);
  return main;
}
