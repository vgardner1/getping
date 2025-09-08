import { useEffect, useState } from 'react';

interface Node {
  x: number;
  y: number; 
  id: number;
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  id: string;
  isFibonacci?: boolean;
  fibValue?: number;
}

// Generate Fibonacci sequence
const generateFibonacci = (n: number): number[] => {
  const fib = [1, 1];
  for (let i = 2; i < n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }
  return fib;
};

export const MyceliumNetwork = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [fibSequence] = useState(() => generateFibonacci(10));
  const [fibIndex, setFibIndex] = useState(0);

  useEffect(() => {
    // Initialize nodes in an organic pattern
    const initialNodes: Node[] = [];
    const centerX = 250;
    const centerY = 200;
    
    // Create nodes in a more organic, clustered pattern
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 80 + Math.random() * 60;
      const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 40;
      const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 40;
      
      initialNodes.push({
        id: i,
        x: Math.max(50, Math.min(450, x)),
        y: Math.max(50, Math.min(350, y))
      });
    }
    setNodes(initialNodes);

    // Create a planned sequence of connections for smooth growth
    const plannedConnections: Array<{from: number, to: number, isFibonacci?: boolean}> = [];
    
    // Start from center node and branch out
    const centerNodeId = 0;
    for (let i = 1; i < initialNodes.length; i++) {
      if (i <= 3) {
        // Direct connections from center, mark middle ones as Fibonacci
        const isFibonacci = i === 2; // Middle connection
        plannedConnections.push({ from: centerNodeId, to: i, isFibonacci });
      } else {
        // Connect to previously connected nodes
        const connectTo = Math.floor(Math.random() * i);
        plannedConnections.push({ from: connectTo, to: i });
      }
    }
    
    // Add some cross-connections for network effect
    plannedConnections.push({ from: 1, to: 3 });
    plannedConnections.push({ from: 2, to: 4 });
    
    // Initiate connection growth sequence
    let connectionIndex = 0;
    const connectionTimer = setInterval(() => {
      if (connectionIndex < plannedConnections.length) {
        const { from, to, isFibonacci } = plannedConnections[connectionIndex];
        const connectionId = `${from}-${to}`;
        
        setConnections(prev => [...prev, {
          from,
          to,
          progress: 0,
          id: connectionId,
          isFibonacci,
          fibValue: isFibonacci ? fibSequence[fibIndex] : undefined
        }]);
        
        if (isFibonacci) {
          setFibIndex(prev => (prev + 1) % fibSequence.length);
        }
        
        connectionIndex++;
      } else {
        clearInterval(connectionTimer);
      }
    }, 1500);

    return () => clearInterval(connectionTimer);
  }, [fibSequence, fibIndex]);

  // Animate connection growth (removed bouncing)
  useEffect(() => {
    const animationTimer = setInterval(() => {
      setConnections(prev => 
        prev.map(conn => ({
          ...conn,
          progress: Math.min(1, conn.progress + 0.025)
        }))
      );
    }, 50);

    return () => clearInterval(animationTimer);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto h-96">
      <svg className="w-full h-full" viewBox="0 0 500 400">
        {/* Render growing connections */}
        {connections.map((connection) => {
          const fromNode = nodes[connection.from];
          const toNode = nodes[connection.to];
          
          if (!fromNode || !toNode) return null;
          
          const length = Math.sqrt(
            Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)
          );
          
          const currentLength = length * connection.progress;
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
          
          const endX = fromNode.x + Math.cos(angle) * currentLength;
          const endY = fromNode.y + Math.sin(angle) * currentLength;
          
          return (
            <g key={connection.id}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={endX}
                y2={endY}
                stroke={connection.isFibonacci ? "rgb(219, 39, 119)" : "rgb(34, 197, 94)"}
                strokeWidth={connection.isFibonacci ? "3.5" : "2.5"}
                className="drop-shadow-sm"
              />
              {/* Static tip (removed pulse animation) */}
              {connection.progress < 1 && (
                <circle
                  cx={endX}
                  cy={endY}
                  r="4"
                  fill={connection.isFibonacci ? "rgb(219, 39, 119)" : "rgb(34, 197, 94)"}
                />
              )}
              {/* Display Fibonacci number on the connection */}
              {connection.isFibonacci && connection.fibValue && connection.progress > 0.5 && (
                <text
                  x={fromNode.x + (toNode.x - fromNode.x) * 0.5}
                  y={fromNode.y + (toNode.y - fromNode.y) * 0.5}
                  fill="rgb(219, 39, 119)"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dy="4"
                  className="drop-shadow-sm"
                >
                  {connection.fibValue}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Render nodes (removed bouncing) */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="7"
            fill="rgba(255, 192, 203, 0.9)"
            stroke="rgb(34, 197, 94)"
            strokeWidth="2.5"
            className="drop-shadow-md"
          />
        ))}
      </svg>
    </div>
  );
};