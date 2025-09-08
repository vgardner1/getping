import { useEffect, useState, useRef } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  id: string;
}

export const NetworkField = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Initialize floating nodes
    const initialNodes: Node[] = [];
    const numNodes = 15;
    
    for (let i = 0; i < numNodes; i++) {
      initialNodes.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }
    
    setNodes(initialNodes);

    // Create connections between nearby nodes
    const initialConnections: Connection[] = [];
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const distance = Math.sqrt(
          Math.pow(initialNodes[i].x - initialNodes[j].x, 2) + 
          Math.pow(initialNodes[i].y - initialNodes[j].y, 2)
        );
        if (distance < 200 && Math.random() > 0.7) {
          initialConnections.push({
            from: i,
            to: j,
            progress: 0,
            id: `${i}-${j}`
          });
        }
      }
    }
    setConnections(initialConnections);

    // Smooth animation loop
    const animate = () => {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;
          let newVx = node.vx;
          let newVy = node.vy;

          // Smooth boundary handling
          if (newX <= 0 || newX >= window.innerWidth) {
            newVx = -newVx * 0.8;
            newX = Math.max(0, Math.min(window.innerWidth, newX));
          }
          if (newY <= 0 || newY >= window.innerHeight) {
            newVy = -newVy * 0.8;
            newY = Math.max(0, Math.min(window.innerHeight, newY));
          }

          return {
            ...node,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          };
        })
      );

      // Slowly grow connections
      setConnections(prevConnections =>
        prevConnections.map(conn => ({
          ...conn,
          progress: Math.min(1, conn.progress + 0.005)
        }))
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg className="w-full h-full">
        {/* Render growing connections */}
        {connections.map((connection) => {
          const fromNode = nodes[connection.from];
          const toNode = nodes[connection.to];
          
          if (!fromNode || !toNode) return null;
          
          const lineLength = Math.sqrt(
            Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)
          );
          const currentLength = lineLength * connection.progress;
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
          const endX = fromNode.x + Math.cos(angle) * currentLength;
          const endY = fromNode.y + Math.sin(angle) * currentLength;
          
          return (
            <line
              key={connection.id}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={endX}
              y2={endY}
              stroke="rgba(34, 197, 94, 0.3)"
              strokeWidth="1"
              className="drop-shadow-sm"
            />
          );
        })}
        
        {/* Render smoothly floating dots */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={3}
            fill="rgba(34, 197, 94, 0.6)"
            className="drop-shadow-sm"
          />
        ))}
      </svg>
    </div>
  );
};