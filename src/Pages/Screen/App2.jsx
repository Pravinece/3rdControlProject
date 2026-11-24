
import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import PF from "pathfinding";

// GRID CONFIGURATION
const GRID_SIZE = 20;
const CELL_SIZE = 1;
const MIN = -10;

const BALL_RADIUS = 1;
const OBSTACLES = [
    {
      id: "box-1",
      position: [2, 1, 0],
      size: [2, 2, 2],
    },
    {
      id: "box-2",
      position: [-4, 1, 3],
      size: [3, 2, 2],
    },
    {
      id: "box-3",
      position: [5, 1, -4],
      size: [1, 2, 4],
    },
  ];

// Convert world position to grid coordinates
function worldToGrid(x, z) {
  return {
    x: Math.max(0, Math.min(19, Math.floor((x - MIN) / CELL_SIZE))),
    y: Math.max(0, Math.min(19, Math.floor((z - MIN) / CELL_SIZE))),
  };
}

// Convert grid coordinates to world position
function gridToWorld(x, y) {
  return [
    MIN + (x + 0.5) * CELL_SIZE,
    1,
    MIN + (y + 0.5) * CELL_SIZE,
  ];
}


function GridDebug({ obstacles }) {
    const grid = useMemo(
      () => createGrid(obstacles),
      [obstacles]
    );
  
    const cells = [];
  
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const walkable = grid.isWalkableAt(x, z);
  
        cells.push(
          <mesh
            key={`${x}-${z}`}
            position={[
              MIN + (x + 0.5) * CELL_SIZE,
              0.03,
              MIN + (z + 0.5) * CELL_SIZE,
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry
              args={[CELL_SIZE * 0.95, CELL_SIZE * 0.95]}
            />
            <meshBasicMaterial
              color={walkable ? "#22c55e" : "#ef4444"}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
        );
      }
    }
  
    return <>{cells}</>;
  }
  

function Obstacles() {
    return (
      <>
        {OBSTACLES.map((obstacle) => (
          <mesh
            key={obstacle.id}
            position={obstacle.position}
            castShadow
            receiveShadow
          >
            <boxGeometry args={obstacle.size} />
            <meshStandardMaterial color="#2196f3" />
          </mesh>
        ))}
      </>
    );
  }

// CREATE GRID AND BLOCK OBSTACLE
function createGrid(obstacles) {
    const grid = new PF.Grid(GRID_SIZE, GRID_SIZE);
  
    // Check every grid cell against every obstacle
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
  
        const cellMinX = MIN + x * CELL_SIZE;
        const cellMaxX = cellMinX + CELL_SIZE;
  
        const cellMinZ = MIN + z * CELL_SIZE;
        const cellMaxZ = cellMinZ + CELL_SIZE;
  
        for (const obstacle of obstacles) {
          const [ox, , oz] = obstacle.position;
          const [width, , depth] = obstacle.size;
  
          // Expand obstacle based on ball radius
          const minX = ox - width / 2 - BALL_RADIUS;
          const maxX = ox + width / 2 + BALL_RADIUS;
  
          const minZ = oz - depth / 2 - BALL_RADIUS;
          const maxZ = oz + depth / 2 + BALL_RADIUS;
  
          const intersects =
            cellMaxX > minX &&
            cellMinX < maxX &&
            cellMaxZ > minZ &&
            cellMinZ < maxZ;
  
          if (intersects) {
            grid.setWalkableAt(x, z, false);
            break;
          }
        }
      }
    }
  
    return grid;
  }

// FLOOR
function Floor({ onFloorClick }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
      onClick={onFloorClick}
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#777777" />
    </mesh>
  );
}

// OBSTACLE
function Box() {
  return (
    <mesh position={[2, 1, 0]} castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#2196f3" />
    </mesh>
  );
}

// MOVING BALL
function Ball({ ballRef, path }) {
  const index = useRef(0);

  // Reset path index whenever a new path is received
  useEffect(() => {
    index.current = 0;
  }, [path]);

  useFrame((_, delta) => {
    if (!ballRef.current || path.length === 0) return;

    if (index.current >= path.length) return;

    const target = path[index.current];
    const position = ballRef.current.position;

    const dx = target[0] - position.x;
    const dz = target[2] - position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    const speed = 3;
    const step = speed * delta;

    if (distance <= step) {
      position.set(target[0], 1, target[2]);
      index.current++;
    } else {
      position.x += (dx / distance) * step;
      position.z += (dz / distance) * step;
    }
  });

  return (
    <mesh ref={ballRef} position={[-2, 1, 0]} castShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

// MAIN SCENE
function Scene() {
  const ballRef = useRef();

  const [path, setPath] = useState([]);

  // Create the grid only once
const grid = useMemo(
  () => createGrid(OBSTACLES),
  []
);
  // FIND PATH WHEN FLOOR IS CLICKED
  const handleFloorClick = (event) => {
    event.stopPropagation();

    if (!ballRef.current) return;

    // Get clicked 3D world position
    const clickX = event.point.x;
    const clickZ = event.point.z;

    // Get current ball position
    const ballPosition = ballRef.current.position;

    // Convert world positions to grid positions
    const start = worldToGrid(
      ballPosition.x,
      ballPosition.z
    );

    const end = worldToGrid(clickX, clickZ);

    // Create a fresh grid because A* modifies search nodes
    const searchGrid = grid.clone();

    // Check whether destination is walkable
    if (!searchGrid.isWalkableAt(end.x, end.y)) {
      console.log("Destination is blocked!");
      return;
    }

    // A* PATHFINDING
    const finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true,
    });

    const result = finder.findPath(
      start.x,
      start.y,
      end.x,
      end.y,
      searchGrid
    );

    if (result.length === 0) {
      console.log("No path found!");
      return;
    }

    // Convert grid path into 3D world positions
    const worldPath = result.map(([x, y]) =>
      gridToWorld(x, y)
    );

    console.log("Grid path:", result);
    console.log("World path:", worldPath);

    setPath(worldPath);
  };

  return (
    <>
      <ambientLight intensity={0.6} />

      <directionalLight
        position={[5, 10, 5]}
        intensity={2}
        castShadow
      />

      <Floor onFloorClick={handleFloorClick} />

      {/* <Box /> */}

      <Ball ballRef={ballRef} path={path} />

      <gridHelper
        args={[20, 20, "white", "#444444"]}
        position={[0, 0.01, 0]}
      />
        <Obstacles />
        <GridDebug obstacles={OBSTACLES} />
      <axesHelper args={[3]} />
      
      <OrbitControls />
    </>
  );
}

export default function App2() {
  return (
    <Canvas
      shadows
      camera={{
        position: [10, 10, 12],
        fov: 50,
      }}
      style={{
        width: "100%",
        height: "100vh",
        background: "#202530",
      }}
    >
      <Scene />
    </Canvas>
  );
}
