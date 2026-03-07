// ========================================
// MapData — Tile grid & buildability system
// ========================================
//
// Tile types used across all levels.
// Defined here so they are available as soon as constants.js loads.
// ========================================

const TILE_TYPES = {
  GRASS:    'grass',    // Can build ✅
  PATH:     'path',     // Cannot build ❌ (enemy route)
  OBSTACLE: 'obstacle', // Cannot build ❌ (building, tree, bench, etc.)
  OCCUPIED: 'occupied'  // Cannot build ❌ (tower already placed here)
};

// ----------------------------------------
// Core helpers
// ----------------------------------------

/**
 * Return the tile type at a pixel coordinate.
 * @param {string[][]} grid
 * @param {number} px  pixel x
 * @param {number} py  pixel y
 * @returns {string}   one of TILE_TYPES
 */
function getTileAt(grid, px, py) {
  if (!grid) return TILE_TYPES.GRASS;
  let col = Math.floor(px / GRID_SIZE);
  let row = Math.floor(py / GRID_SIZE);
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
    return TILE_TYPES.OBSTACLE;
  }
  return grid[row][col];
}

/**
 * Mark a grid cell as OCCUPIED after a tower is placed there.
 * @param {string[][]} grid
 * @param {number} px  grid-center pixel x
 * @param {number} py  grid-center pixel y
 */
function occupyTile(grid, px, py) {
  if (!grid) return;
  let col = Math.floor(px / GRID_SIZE);
  let row = Math.floor(py / GRID_SIZE);
  if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
    grid[row][col] = TILE_TYPES.OCCUPIED;
  }
}

/**
 * Revert an OCCUPIED tile back to GRASS (e.g. on tower removal).
 */
function freeTile(grid, px, py) {
  if (!grid) return;
  let col = Math.floor(px / GRID_SIZE);
  let row = Math.floor(py / GRID_SIZE);
  if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
    if (grid[row][col] === TILE_TYPES.OCCUPIED) {
      grid[row][col] = TILE_TYPES.GRASS;
    }
  }
}

// ----------------------------------------
// Generic grid builder (used by future levels)
// ----------------------------------------

/**
 * Build a tile grid by tracing path waypoints and marking obstacle cells.
 * pathHalfWidth = extra cells to mark on each side of the path centre.
 */
function buildTileGrid(waypoints, obstacles = [], pathHalfWidth = 1) {
  let cols = Math.ceil(CANVAS_WIDTH  / GRID_SIZE) + 1;
  let rows = Math.ceil(CANVAS_HEIGHT / GRID_SIZE) + 1;

  let grid = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = new Array(cols).fill(TILE_TYPES.GRASS);
  }

  function markPath(r, c) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = TILE_TYPES.PATH;
    }
  }

  for (let i = 0; i < waypoints.length - 1; i++) {
    let wp   = waypoints[i];
    let next = waypoints[i + 1];
    let c1 = Math.floor(wp.x   / GRID_SIZE);
    let r1 = Math.floor(wp.y   / GRID_SIZE);
    let c2 = Math.floor(next.x / GRID_SIZE);
    let r2 = Math.floor(next.y / GRID_SIZE);

    if (r1 === r2) {
      let minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
      for (let c = minC; c <= maxC; c++)
        for (let dr = -pathHalfWidth; dr <= pathHalfWidth; dr++)
          markPath(r1 + dr, c);
    } else if (c1 === c2) {
      let minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
      for (let r = minR; r <= maxR; r++)
        for (let dc = -pathHalfWidth; dc <= pathHalfWidth; dc++)
          markPath(r, c1 + dc);
    }
  }

  for (let obs of obstacles) {
    let { col, row } = obs;
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      grid[row][col] = TILE_TYPES.OBSTACLE;
    }
  }

  return grid;
}

// ========================================
// Level 1 — whitelist grid
// ========================================
//
// Encoding : 0 = not buildable  |  2 = grass (buildable)
// Size     : 32 cols (0-31) × 15 rows (0-14)
//
// Default: every cell is 0 (not buildable).
// Only cells explicitly listed in the whitelist below are set to 2.
//
// To add/remove a buildable cell:
//   1. Press D in-game, click the cell → console logs col & row.
//   2. Find LEVEL_1_GRID[row][col] and change 0↔2.
//   3. Reload — the debug overlay updates immediately.
// ─────────────────────────────────────────────────────────────────────
const LEVEL_1_GRID = (() => {
  // Start with a 15×32 grid of all zeroes
  const g = Array.from({ length: 15 }, () => new Array(32).fill(0));

  // Whitelist: [col, row] pairs → mark as 2 (grass / buildable)
  const whitelist = [
    // col 1
    [1,9],
    // col 2
    [2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,9],
    // col 3
    [3,9],
    // col 4
    [4,9],
    // col 5
    [5,3],[5,4],[5,5],[5,6],[5,7],[5,8],
    // col 6
    [6,3],
    // col 7
    [7,3],[7,4],[7,5],[7,6],[7,7],[7,8],[7,9],[7,10],[7,11],[7,12],[7,13],
    // col 10
    [10,2],[10,3],[10,4],[10,5],[10,6],[10,7],[10,8],[10,9],[10,10],[10,11],
    // col 11
    [11,3],[11,4],[11,8],[11,9],[11,10],[11,11],
    // col 12
    [12,4],[12,7],[12,8],[12,9],[12,10],[12,11],
    // col 13
    [13,1],[13,2],[13,3],[13,4],[13,6],
    // col 14
    [14,1],[14,2],[14,3],[14,4],[14,6],
    // col 15
    [15,1],[15,2],[15,3],[15,4],[15,6],[15,9],[15,10],[15,11],[15,12],[15,13],
    // col 16
    [16,1],[16,2],[16,3],[16,4],[16,5],[16,6],[16,9],[16,10],[16,11],[16,12],[16,13],
    // col 17
    [17,1],[17,2],[17,3],[17,4],[17,5],[17,6],[17,9],[17,10],[17,11],[17,12],[17,13],
    // col 18
    [18,1],[18,2],[18,3],[18,4],[18,9],[18,10],[18,11],[18,12],[18,13],
    // col 19
    [19,4],[19,9],[19,10],[19,11],[19,12],[19,13],
    // col 20
    [20,9],[20,10],[20,11],[20,12],[20,13],
    // col 21
    [21,9],[21,10],[21,11],[21,12],[21,13],
    // col 22
    [22,9],[22,10],[22,11],[22,12],[22,13],
    // col 23
    [23,9],[23,10],[23,11],[23,12],[23,13],
    // col 24
    [24,9],[24,10],[24,11],[24,12],[24,13],
    // col 25
    [25,9],[25,10],[25,11],[25,12],[25,13],
    // col 26
    [26,9],[26,10],[26,11],[26,12],[26,13],
    // col 27
    [27,9],[27,10],[27,11],[27,12],[27,13],
    // col 28
    [28,9],[28,10],[28,11],[28,12],[28,13],
    // col 29
    [29,9],[29,10],[29,11],[29,12],[29,13],
    // col 30
    [30,9],[30,12],
  ];

  for (const [col, row] of whitelist) {
    g[row][col] = 2;
  }

  return g;
})();

// Maps integer encoding → TILE_TYPES string
const _GRID_DECODE = [
  TILE_TYPES.OBSTACLE, // 0
  TILE_TYPES.PATH,     // 1
  TILE_TYPES.GRASS,    // 2
];

// ----------------------------------------
// Level 1 map data
// ----------------------------------------

/**
 * Convert LEVEL_1_GRID into the runtime string[][] used by the engine.
 *
 * Cells outside the 32×15 reference default to OBSTACLE (safe for any
 * screen size larger than the reference resolution).
 */
function getLevel1MapData() {
  let totalRows = Math.ceil(CANVAS_HEIGHT / GRID_SIZE) + 1;
  let totalCols = Math.ceil(CANVAS_WIDTH  / GRID_SIZE) + 1;
  let refRows   = LEVEL_1_GRID.length;       // 15
  let refCols   = LEVEL_1_GRID[0].length;    // 32

  let grid = [];
  for (let r = 0; r < totalRows; r++) {
    grid[r] = [];
    for (let c = 0; c < totalCols; c++) {
      if (r < refRows && c < refCols) {
        grid[r][c] = _GRID_DECODE[LEVEL_1_GRID[r][c]] || TILE_TYPES.OBSTACLE;
      } else {
        grid[r][c] = TILE_TYPES.OBSTACLE;
      }
    }
  }

  console.log(
    `[MapData] Level 1 grid: canvas ${totalCols}×${totalRows}, ` +
    `reference ${refCols}×${refRows}`
  );
  return grid;
}

/**
 * Returns true when a tile can receive a new tower.
 */
function isBuildable(grid, px, py) {
  return getTileAt(grid, px, py) === TILE_TYPES.GRASS;
}
