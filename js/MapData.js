// ========================================
// MapData — Tile grid & buildability system
// ========================================

const TILE_TYPES = {
  GRASS:    'grass',
  PATH:     'path',
  OBSTACLE: 'obstacle',
  OCCUPIED: 'occupied'
};

// ----------------------------------------
// Core helpers
// ----------------------------------------

function getTileAt(grid, px, py) {
  if (!grid) return TILE_TYPES.GRASS;
  let col = Math.floor(px / GRID_SIZE);
  let row = Math.floor(py / GRID_SIZE);
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
    return TILE_TYPES.OBSTACLE;
  }
  return grid[row][col];
}

function occupyTile(grid, px, py) {
  if (!grid) return;
  let col = Math.floor(px / GRID_SIZE);
  let row = Math.floor(py / GRID_SIZE);
  if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
    grid[row][col] = TILE_TYPES.OCCUPIED;
  }
}

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

// ========================================
// Level 1 — whitelist grid
// 15 rows × 32 cols（与 ROWS × COLS 完全匹配）
// ========================================

const LEVEL_1_GRID = (() => {
  // 15 行 × 32 列
  const g = Array.from({ length: 15 }, () => new Array(32).fill(0));

  // Whitelist: [col, row] pairs → mark as 2 (grass / buildable)
  // col 范围：0-31，row 范围：0-14
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
    [6,3],[6,4],[6,5],[6,6],[6,7],
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
    // col 30（最大 col=31，所以 30 是倒数第二列）
    [30,9],[30,12],
  ];

  for (const [col, row] of whitelist) {
    if (row >= 0 && row < 15 && col >= 0 && col < 32) {
      g[row][col] = 2;
    }
  }

  return g;
})();

const _GRID_DECODE = [
  TILE_TYPES.OBSTACLE, // 0
  TILE_TYPES.PATH,     // 1
  TILE_TYPES.GRASS,    // 2
];

function getLevel1MapData() {
  let grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      let val = (r < LEVEL_1_GRID.length && c < LEVEL_1_GRID[0].length)
        ? LEVEL_1_GRID[r][c]
        : 0;
      grid[r][c] = _GRID_DECODE[val] || TILE_TYPES.OBSTACLE;
    }
  }
  console.log(`[MapData] Level 1 grid: ${COLS}×${ROWS} (matches COLS×ROWS)`);
  return grid;
}

function isBuildable(grid, px, py) {
  return getTileAt(grid, px, py) === TILE_TYPES.GRASS;
}
