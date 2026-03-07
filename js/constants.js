// ========================================
// 🎮 保卫英国 — 全局常量配置
// ========================================

// --- 画布设置 ---
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const FPS = 60;

// --- 网格设置 ---
const GRID_SIZE = 60;  // 每个格子 60×60 像素
const COLS = CANVAS_WIDTH / GRID_SIZE;   // 20 列
const ROWS = CANVAS_HEIGHT / GRID_SIZE;  // 约 13 行

// --- 游戏状态 ---
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WIN: 'win',
  LOSE: 'lose',
  SETTINGS: 'settings'
};

// --- 经济系统 ---
const INITIAL_GOLD = 200;        // 开局金币
const ENEMY_KILL_REWARD = {      // 击杀奖励
  basic: 10,
  fast: 15,
  tank: 20,
  boss: 50
};

// --- 塔的价格 ---
const TOWER_COST = {
  basic: 50,       // 基础塔
  slow: 100,       // 减速塔
  area: 150        // 范围塔
};

// --- 地标（被保护的建筑） ---
const LANDMARK_MAX_HP = 100;      // 地标总血量
const ENEMY_REACH_DAMAGE = 20;    // 怪物到达终点扣 1 滴血

// --- 关卡设置 ---
const TOTAL_LEVELS = 3;
