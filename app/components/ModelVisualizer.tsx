import { useEffect, useRef } from "react"
import * as d3 from 'd3'
import { ModelState } from "../types/ModelStateControlTypes";

interface Node extends d3.SimulationNodeDatum {
  id: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  id: number;
  source: Node;
  target: Node;
};

type ModelVisualizerProps = {
  styles: {readonly [key:string]: string},
  modelState: ModelState
}

type ModelGraph = {
  nodes: 
    Array<{
      x:number,
      y:number
    }> | undefined,
  edges: Array<
    {
      id: number,
      source: number,
      target: number
    }> | undefined
}


export default function ModelVisualizer({styles, modelState}:ModelVisualizerProps) {

  const ModelVisualizerCanvas = useRef<HTMLCanvasElement|null>(null)

  useEffect(() => {
      const calculateModelGraph = () : ModelGraph => {
        const modelGraph: ModelGraph = {
          nodes: undefined,
          edges: undefined
        }

        // Add Nodes
        modelState.layers.forEach((layer, idx)=>{
          for (let i = 0; i < layer.units; i++) {
            if (modelGraph.nodes) {
              modelGraph.nodes = [...modelGraph.nodes].concat([{x:idx, y:i}])
            }
            else{
              modelGraph.nodes = [{x:idx, y:i}]
            }
          }
        })

        // Calculate Edges
        let edgeCount:number = 0;

        for (let i = 0; i < modelState.nlayers-1; i++) {
          for (let j = 0; j < modelState.layers[i].units; j++) {
            for (let k = 0; k < modelState.layers[i+1].units; k++) {
              edgeCount++;
              if(modelGraph.edges){
                modelGraph.edges = [...modelGraph.edges].concat([{id:edgeCount, source: modelGraph.nodes?.findIndex(elem=> elem.x === i && elem.y === j) as number, target:modelGraph.nodes?.findIndex(elem=> elem.x === i+1 && elem.y === k) as number}]);
              }
              else{
                modelGraph.edges = [{id:edgeCount, source: modelGraph.nodes?.findIndex(elem=> elem.x === i && elem.y === j) as number, target:modelGraph.nodes?.findIndex(elem=> elem.x === i+1 && elem.y === k) as number}];
              }
            }
            
          }
        }

        return modelGraph
      }

      (() => {
        const modelGraph = calculateModelGraph();
        const gNodes = modelGraph.nodes?.map((v,idx)=>{
          return {
            id: idx,
            x: v.x,
            y: v.y
          }
        })
        const nodes: Node[] = gNodes as Node[]
        const edges = modelGraph.edges as unknown as Link[]
        const simulation = d3.forceSimulation(nodes)

        // Make sure the canvas is clean
        ModelVisualizerCanvas.current?.childNodes.forEach(child => {
          ModelVisualizerCanvas.current?.removeChild(child)
        })

        const width = 220
        const height = 300

        const svg = d3.select(ModelVisualizerCanvas.current).append("svg").attr("width", width).attr("height", height);
        const node = svg.selectAll("circle").data(nodes).enter().append("circle").attr("r", 20).attr("cx", d => (d.x ?? 0)+(width/2)).attr("cy", d => (d.y ?? 0)+(height/2)).attr("fill", "steelblue").call(d3.drag());
        let links = undefined;
        if(edges){
          links = svg.append("g").selectAll("line").data(edges).enter().append("line").attr("stroke-width", 3).style("stroke", "yellow").call(d3.drag());
        }
        simulation.force("charge", d3.forceManyBody().strength(-5));
        simulation.force("center", d3.forceCenter(width/2, height/2))
        simulation.force("link", d3.forceLink<Node,Link>(edges).distance(70).strength(0.05))
        simulation.on("tick", () => {
          node.attr("cx", d => d.x ?? 0).attr("cy", d => d.y ?? 0);
          if(links){
            links.attr("x1", d=> d.source.x ?? 0).attr("x2", d=>d.target.x ?? 0).attr("y1", d=> d.source.y ?? 0).attr("y2",d => d.target.y ?? 0)
          }
        })
      })()
    }, [modelState])

  return (
    <article ref={ModelVisualizerCanvas} className={styles.modelVisualizer}></article>
  )
}
