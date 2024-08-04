import "@xyflow/react/dist/style.css";
import Navbar from "@/app/components/Navbar";
import _ from "lodash";
import classNames from "classnames";
import moment from "moment";
import parser from "cron-parser";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useDebounce } from "use-debounce";
import { ObjectMeta } from "@/core/VM";

import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  getBezierPath,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

const fetchObjects = async () => {
  const res = await fetch("/api/object/list");
  return res.json();
};

function FlowNode({ data }: any) {
  const { id, name, description, schedule } = data as ObjectMeta;
  const [thisMoment, setThisMoment] = useState(moment());

  const tryParseCron = (cron: string) => {
    try {
      return parser.parseExpression(cron).next();
    } catch (e) {
      return undefined;
    }
  };

  useEffect(() => {
    const timeout = setInterval(() => {
      setThisMoment(moment());
    }, 100);

    return () => {
      clearInterval(timeout);
    };
  }, []);

  return (
    <div className="bg-white border-gray-400 hover:border-black border-b-2 border rounded-md min-w-[65px]">
      <div className="flex">
        <div className="py-1.5 px-2.5">
          <div className="text-sm font-medium flex flex-row gap-2 items-center">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              height="1em"
              width="1em"
              className="size-3"
            >
              <path d="M12.42 5.29c-1.1-.1-2.07.71-2.17 1.82L10 10h2.82v2h-3l-.44 5.07A4.001 4.001 0 012 18.83l1.5-1.5c.33 1.05 1.46 1.64 2.5 1.3.78-.24 1.33-.93 1.4-1.74L7.82 12h-3v-2H8l.27-3.07a4.01 4.01 0 014.33-3.65c1.26.11 2.4.81 3.06 1.89l-1.5 1.5c-.25-.77-.93-1.31-1.74-1.38M22 13.65l-1.41-1.41-2.83 2.83-2.83-2.83-1.43 1.41 2.85 2.85-2.85 2.81 1.43 1.41 2.83-2.83 2.83 2.83L22 19.31l-2.83-2.81L22 13.65z" />
            </svg>
            <span>{name || id}</span>
          </div>
          <div className="text-[10px] text-gray-500 max-w-[180px]">
            {description}
          </div>

          <div className="mt-2">
            {schedule &&
              _.isArray(schedule) &&
              schedule?.map((time) => (
                <div className="text-[10px] text-gray-500 max-w-[180px] flex flex-row items-center justify-start gap-2">
                  <svg
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    height="1em"
                    width="1em"
                    className="size-2 flex-shrink-0"
                  >
                    <path d="M256 512C114.6 512 0 397.4 0 256S114.6 0 256 0s256 114.6 256 256-114.6 256-256 256zm-24-392v136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" />
                  </svg>
                  <span
                    className={classNames({
                      "text-gray-400": true,
                      "text-orange-600 font-medium":
                        thisMoment.diff(
                          moment(tryParseCron(time)?.toDate() || new Date()),
                          "s"
                        ) > -3,
                    })}
                  >
                    {tryParseCron(time)?.toDate()?.toLocaleString()}{" "}
                    <span>
                      {thisMoment.format("dddd, MMMM Do YYYY, h:mm:ss a") &&
                        moment(tryParseCron(time)?.toDate()).fromNow()}
                    </span>
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-32 !bg-yellow-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-32 !bg-indigo-500"
      />
    </div>
  );
}

function TypeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  label,
}: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="nodrag nopan"
        >
          <pre className="text-[10px] shadow-sm border border-gray-200 bg-white px-2 py-1 rounded">
            {typeof label == "string" ? label : JSON.stringify(label, null, 2)}
          </pre>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default function CallHistory() {
  const { data, isError, isFetched, isLoading } = useQuery(
    "objects",
    fetchObjects
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [nodesDebounce] = useDebounce(nodes, 1000);

  /**
   * Generates a node object with strongly typed properties.
   *
   * @param {Object} node - The node object containing id and description properties.
   * @param {number} x - The x coordinate of the node.
   * @param {number} y - The y coordinate of the node.
   * @return {Object} The generated node object with strongly typed properties.
   */
  const generateNode = (
    node: { id: string; description: string },
    x: number,
    y: number
  ): {
    id: string;
    type: string;
    data: { label: string };
    position: { x: number; y: number };
  } => ({
    id: node.id,
    type: "flowNode",
    data: { ...node, label: "" },
    position: { x, y },
  });

  /**
   * Generates an array of edge objects with strongly typed properties.
   *
   * @param {string[]} deps - An array of dependency IDs.
   * @param {string} fromId - The ID of the node from which the edges originate.
   * @return {Array<{ id: string, source: string, target: string, animated: boolean, style: { stroke: string, strokeDasharray: string } }>}
   * An array of edge objects with strongly typed properties.
   */
  const generateEdges = (
    deps: string[],
    fromId: string
  ): Array<{
    id: string;
    source: string;
    target: string;
    animated: boolean;
    style: { stroke: string; strokeDasharray: string };
  }> => {
    return deps.map((dep) => {
      const typed = data.data?.find((node: any) => node.id === dep)?.resultTypes;
      let strokeColor = "gray"

      console.log(typed)

      if (typed == "String") {
        strokeColor = "green"
      } else if (typed == "Number") {
        strokeColor = "blue"
      } else if (typed == "Boolean") {
        strokeColor = "red"
      }

      return {
        id:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
        target: fromId,
        source: dep,
        animated: true,
        data: {
          any: 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        markerStart: {
          // type: MarkerType.ArrowClosed,
          // orient: 'auto-start-reverse',
        },
        label: typed,
        style: { stroke: strokeColor, strokeDasharray: "5,2" },
        type: "typed",
      };
    });
  };

  //   const elements = [...nodeElements];

  useEffect(() => {
    const nodeElements = data?.data?.map((node: any, index: number) =>
      generateNode(
        node,
        parseInt(node.node?.position?.x || "0"),
        parseInt(node.node?.position?.y || "0")
      )
    );

    const edgeElements = data?.data
      ?.filter((node: any) => node.deps)
      ?.flatMap((node: any) => generateEdges(node.deps, node.id));

    setNodes(nodeElements);
    setEdges(edgeElements);
  }, [data]);

  useEffect(() => {
    const nodes = nodesDebounce.map((node: any) => ({
      x: node.position.x,
      y: node.position.y,
      id: node.id,
    }));

    fetch("/api/object/node/position", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nodes }),
    });
  }, [nodesDebounce]);

  return (
    <main className="w-full h-screen">
      <Navbar />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        style={{ width: "100%", height: "100vh" }}
        snapToGrid={false}
        snapGrid={[32, 32]}
        fitView
        fitViewOptions={{ padding: 1 }}
        nodeOrigin={[0.5, 0]}
        nodeTypes={{
          flowNode: FlowNode,
        }}
        edgeTypes={{
          typed: TypeEdge,
        }}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        {/* <MiniMap /> */}
      </ReactFlow>
    </main>
  );
}
