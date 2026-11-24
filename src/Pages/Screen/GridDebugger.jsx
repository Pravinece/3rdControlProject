
import { useMemo } from "react";
import * as THREE from "three";

export default function GridDebugger({
  grid,
  config,
  floorY = 0.03,
  path = [],
  visible = true,
}) {
  const cells = useMemo(() => {
    if (!grid) return [];

    const result = [];

    for (let x = 0; x < grid.width; x++) {
      for (let z = 0; z < grid.height; z++) {
        const walkable = grid.isWalkableAt(x, z);

        const worldX =
          config.minX + (x + 0.5) * config.cellSize;

        const worldZ =
          config.minZ + (z + 0.5) * config.cellSize;

        result.push({
          key: `${x}-${z}`,
          x: worldX,
          z: worldZ,
          color: walkable ? "#22c55e" : "#ef4444",
        });
      }
    }

    return result;
  }, [grid, config]);

  const pathCells = useMemo(() => {
    return new Set(
      path.map((point) => {
        const gx = Math.floor(
          (point.x - config.minX) / config.cellSize
        );
        const gz = Math.floor(
          (point.z - config.minZ) / config.cellSize
        );

        return `${gx}-${gz}`;
      })
    );
  }, [path, config]);

  if (!visible) return null;

  return (
    <group>
      {cells.map((cell) => {
        const gx = Math.floor(
          (cell.x - config.minX) / config.cellSize
        );
        const gz = Math.floor(
          (cell.z - config.minZ) / config.cellSize
        );

        const isPath = pathCells.has(`${gx}-${gz}`);

        return (
          <mesh
            key={cell.key}
            position={[cell.x, floorY, cell.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry
              args={[
                config.cellSize * 0.94,
                config.cellSize * 0.94,
              ]}
            />
            <meshBasicMaterial
              color={isPath ? "#facc15" : cell.color}
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
