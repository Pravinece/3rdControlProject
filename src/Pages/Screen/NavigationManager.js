import PF from 'pathfinding';
import * as THREE from 'three';

// ─── GRID CONFIG ────────────────────────────────────────────────────────────
// Covers the room floor. Tune GRID_SIZE and CELL_SIZE to match your room scale.
const GRID_COLS  = 30;   // X axis cells
const GRID_ROWS  = 30;   // Z axis cells
const CELL_SIZE  = 0.5;  // world units per cell

// World origin of the grid (top-left corner in XZ)
const GRID_ORIGIN_X = -5;
const GRID_ORIGIN_Z = -5;

// ─── OBSTACLES ──────────────────────────────────────────────────────────────
// Mark cells as unwalkable [col, row]. Add more to match your room furniture.
const OBSTACLES = [
  // example: sofa area
  // [10, 8], [11, 8], [10, 9], [11, 9],
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

/** World XZ → grid cell */
function worldToGrid(x, z) {
  const col = Math.round((x - GRID_ORIGIN_X) / CELL_SIZE);
  const row = Math.round((z - GRID_ORIGIN_Z) / CELL_SIZE);
  return [
    Math.max(0, Math.min(GRID_COLS - 1, col)),
    Math.max(0, Math.min(GRID_ROWS - 1, row)),
  ];
}

/** Grid cell → world XZ (Y kept flat) */
function gridToWorld(col, row, y = 0) {
  return new THREE.Vector3(
    GRID_ORIGIN_X + col * CELL_SIZE,
    y,
    GRID_ORIGIN_Z + row * CELL_SIZE
  );
}

/** Build a fresh grid (must be cloned each find call — pathfinding.js mutates it) */
function buildGrid() {
  const grid = new PF.Grid(GRID_COLS, GRID_ROWS);
  OBSTACLES.forEach(([c, r]) => grid.setWalkableAt(c, r, false));
  return grid;
}

/** Convert raw path array → smooth CatmullRom curve waypoints */
function pathToCurve(rawPath, y = 0) {
  if (rawPath.length < 2) return null;

  const points = rawPath.map(([c, r]) => gridToWorld(c, r, y));

  // Need at least 3 points for CatmullRom; duplicate ends if needed
  if (points.length === 2) points.splice(1, 0, points[0].clone().lerp(points[1], 0.5));

  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
}

// ─── FINDER ─────────────────────────────────────────────────────────────────
const finder = new PF.AStarFinder({
  allowDiagonal: true,
  dontCrossCorners: true,
});

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────

/**
 * Calculate a smooth path from current world position to destination.
 *
 * @param {THREE.Vector3} from  - current avatar world position
 * @param {string}        mode  - key from AVATAR_POSITIONS
 * @param {object}        AVATAR_POSITIONS - imported positions map
 * @returns {{ curve: THREE.CatmullRomCurve3, targetRotation: number, totalLength: number } | null}
 */
export function calculatePath(from, mode, AVATAR_POSITIONS) {
  const dest = AVATAR_POSITIONS[mode];
  if (!dest) return null;

  const [toX, , toZ] = dest.position;
  const [startCol, startRow] = worldToGrid(from.x, from.z);
  const [endCol,   endRow  ] = worldToGrid(toX, toZ);

  if (startCol === endCol && startRow === endRow) return null;

  const grid    = buildGrid();
  const rawPath = finder.findPath(startCol, startRow, endCol, endRow, grid);

  if (!rawPath.length) {
    console.warn('[Nav] No path found from', from, 'to', dest.position);
    return null;
  }

  const smoothed = PF.Util.smoothenPath(grid.clone(), rawPath);
  const curve    = pathToCurve(smoothed, from.y);

  // Final facing angle from dest.rotation[1] (Y euler)
  const targetRotation = dest.rotation[1];

  return {
    curve,
    targetRotation,
    totalLength: curve.getLength(),
  };
}

/**
 * Call this every frame while navigating.
 * Advances `progressRef` along the curve and updates the RigidBody position.
 *
 * @param {object} opts
 * @param {React.MutableRefObject} opts.rbRef          - RigidBody ref
 * @param {React.MutableRefObject} opts.characterRef   - character mesh group ref
 * @param {React.MutableRefObject} opts.progressRef    - { current: 0..1 } progress along curve
 * @param {THREE.CatmullRomCurve3} opts.curve          - path curve
 * @param {number}                 opts.targetRotation - final Y rotation (radians)
 * @param {number}                 opts.speed          - world units per second
 * @param {number}                 opts.delta          - useFrame delta
 * @param {Function}               opts.onArrive       - called once when destination reached
 * @returns {boolean} true = still moving, false = arrived
 */

export function followPath({ rbRef, characterRef, progressRef, curve, targetRotation, speed, delta, onArrive }) {
  if (!rbRef.current || !curve) return false;

  const totalLength = curve.getLength();
  const step        = (speed * delta) / totalLength;

  progressRef.current = Math.min(progressRef.current + step, 1);

  const pos     = curve.getPoint(progressRef.current);
  const tangent = curve.getTangent(progressRef.current);

  // Move rigidbody
  rbRef.current.setTranslation({ x: pos.x, y: pos.y, z: pos.z }, true);
  rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

  // Rotate character to face movement direction, lerp to final rotation near end
  const movementAngle = Math.atan2(tangent.x, tangent.z);
  const blendToFinal  = THREE.MathUtils.smoothstep(progressRef.current, 0.8, 1.0);
  const finalAngle    = THREE.MathUtils.lerp(movementAngle, targetRotation, blendToFinal);

  if (characterRef.current) {
    characterRef.current.rotation.y = THREE.MathUtils.lerp(
      characterRef.current.rotation.y,
      finalAngle,
      0.12
    );
  }

  if (progressRef.current >= 1) {
    onArrive?.();
    return false; // arrived
  }

  return true; // still moving
}

/**
 * Expose grid config so you can visualize it in debug mode.
 */
export const NAV_GRID = { GRID_COLS, GRID_ROWS, CELL_SIZE, GRID_ORIGIN_X, GRID_ORIGIN_Z };
