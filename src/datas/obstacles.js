
import * as THREE from "three";
import PF from "pathfinding";

// ROOM CONFIGURATION
export const GRID_CONFIG = {
  cellSize: 0.5,
  minX: -10,
  minZ: -10,
  width: 40,
  height: 40,
};

// Character collision radius
export const CHARACTER_RADIUS = 0.3;

// Objects that should block movement
export const OBSTACLE_NAMES = [
  "sofa_sofa1001_0",
  "sofa_sofa2001_0",
  "table_table1001_0",
  "table_table2001_0",
  "wall_wall001_0",
  "light_light1001_0",
  "light_light3001_0",
  "house_house001_0",
  "dec_dec001_0",
  "vase_vase001_0",
  "lamp_lamp1001_0",
  "lamp_lamp2001_0",
  "Plastic_pot_Plastic_pot001_0",
  "plants_plants001_0",
  "pillow_pillow1001_0",
  "pillow_pillow2001_0",
];

// 1. EXTRACT OBSTACLES FROM GLB
export function extractObstacles(scene) {
  scene.updateWorldMatrix(true, true);

  const obstacles = [];

  scene.traverse((object) => {
    if (!object.isMesh) return;

    if (!OBSTACLE_NAMES.includes(object.name)) return;

    const bounds = new THREE.Box3().setFromObject(object);

    if (bounds.isEmpty()) return;

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    bounds.getCenter(center);
    bounds.getSize(size);

    obstacles.push({
      id: object.uuid,
      name: object.name,

      position: center.toArray(),
      size: size.toArray(),

      bounds: {
        minX: bounds.min.x,
        maxX: bounds.max.x,
        minZ: bounds.min.z,
        maxZ: bounds.max.z,
      },
    });
  });

  return obstacles;
}

// 2. WORLD POSITION TO GRID
export function worldToGrid(position) {
  const { minX, minZ, cellSize } = GRID_CONFIG;

  return {
    x: Math.floor((position.x - minX) / cellSize),
    y: Math.floor((position.z - minZ) / cellSize),
  };
}

// 3. GRID TO WORLD POSITION
export function gridToWorld(x, y, worldY) {
  const { minX, minZ, cellSize } = GRID_CONFIG;

  return new THREE.Vector3(
    minX + (x + 0.5) * cellSize,
    worldY,
    minZ + (y + 0.5) * cellSize
  );
}

// 4. CHECK GRID BOUNDARIES
export function isInsideGrid(x, y) {
  const { width, height } = GRID_CONFIG;

  return (
    x >= 0 &&
    y >= 0 &&
    x < width &&
    y < height
  );
}

// 5. CREATE GRID AND MARK OBSTACLES
export function createGrid(obstacles) {
  const { width, height, minX, minZ, cellSize } =
    GRID_CONFIG;

  const grid = new PF.Grid(width, height);

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < height; z++) {

      const cellMinX = minX + x * cellSize;
      const cellMaxX = cellMinX + cellSize;

      const cellMinZ = minZ + z * cellSize;
      const cellMaxZ = cellMinZ + cellSize;

      for (const obstacle of obstacles) {

        const minObstacleX =
          obstacle.bounds.minX - CHARACTER_RADIUS;

        const maxObstacleX =
          obstacle.bounds.maxX + CHARACTER_RADIUS;

        const minObstacleZ =
          obstacle.bounds.minZ - CHARACTER_RADIUS;

        const maxObstacleZ =
          obstacle.bounds.maxZ + CHARACTER_RADIUS;

        const intersects =
          cellMaxX > minObstacleX &&
          cellMinX < maxObstacleX &&
          cellMaxZ > minObstacleZ &&
          cellMinZ < maxObstacleZ;

        if (intersects) {
          grid.setWalkableAt(x, z, false);
          break;
        }
      }
    }
  }

  return grid;
}

// 6. FIND PATH USING A*
export function findPath(grid, startPosition, targetPosition) {
  const start = worldToGrid(startPosition);
  const end = worldToGrid(targetPosition);

  if (
    !isInsideGrid(start.x, start.y) ||
    !isInsideGrid(end.x, end.y)
  ) {
    console.warn("Start or destination outside grid");
    return [];
  }

  const searchGrid = grid.clone();

  // Destination must be walkable
  if (!searchGrid.isWalkableAt(end.x, end.y)) {
    console.warn("Destination is blocked");
    return [];
  }

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

  return result.map(([x, y]) =>
    gridToWorld(x, y, startPosition.y)
  );
}
