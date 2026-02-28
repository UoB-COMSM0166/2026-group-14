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
export const ENEMY_KILL_REWARD = {      // 击杀奖励
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
export const ENEMY_REACH_DAMAGE = 20;    // 怪物到达终点扣 1 滴血

// --- 关卡设置 ---
const TOTAL_LEVELS = 3;

// --- Enenmy Part --
export const ENEMY_SPAWN_INTERVAL = 1000;    //敌人出生间隔
// 波次配置
export const WAVES = [                     
    //wave 1
    [{type: 'basic', count: 5}],
    //wave 2
    [{type: 'basic', count: 8}, {type: 'fast', count: 3}],
    //wave 3
    [{type: 'fast', count: 2}, {type: 'basic', count: 10}],
    //wave 4
    [{type: 'boss', count: 1}]
];
