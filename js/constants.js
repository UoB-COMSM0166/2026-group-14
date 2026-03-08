// ========================================
// 🎮 保卫英国 — 全局常量配置
// ========================================

// --- 画布设置（网格完美覆盖，无空隙） ---
const GRID_SIZE = 60;  // 每个格子 60×60 像素
const COLS = 32;       // 32 列
const ROWS = 15;       // 15 行
const DESIGN_WIDTH = COLS * GRID_SIZE;   // 32 × 60 = 1920
const DESIGN_HEIGHT = ROWS * GRID_SIZE;  // 15 × 60 = 900
const CANVAS_WIDTH = DESIGN_WIDTH;
const CANVAS_HEIGHT = DESIGN_HEIGHT;
const FPS = 60;
const HUD_HEIGHT = 45;  // 顶部 HUD 栏高度

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
const INITIAL_GOLD = 350;
const ENEMY_KILL_REWARD = {
  basic: 20,
  fast: 25,
  tank: 40,
  boss: 50
};
const WAVE_CLEAR_BONUS_GOLD = 50;
const WAVE_BONUS_DISPLAY_FRAMES = 120;

// --- 塔类型配置 ---
const TOWER_TYPES = {
  basic: {
    name: "Basic Tower",
    cost: 50,
    range: 150,
    damage: 25,
    fireRate: 60,
    bulletSpeed: 5,
    color: [70, 130, 230],
    description: "Balanced tower. Reliable damage.",
    bulletColor: [255, 255, 0],
    size: 18
  },
  slow: {
    name: "Slow Tower",
    cost: 75,
    range: 130,
    damage: 10,
    fireRate: 80,
    bulletSpeed: 5,
    color: [70, 200, 120],
    description: "Slows enemies. Low damage.",
    bulletColor: [100, 200, 255],
    size: 18,
    slowEffect: 0.5,
    slowDuration: 90
  },
  area: {
    name: "Area Tower",
    cost: 120,
    range: 200,
    damage: 12,
    fireRate: 90,
    bulletSpeed: 10,
    color: [220, 80, 60],
    description: "Damages all enemies in range.",
    bulletColor: [255, 150, 50],
    size: 22,
    splashRadius: 120,
    areaPulseDuration: 9
  }
};
const TOWER_PANEL_HEIGHT = 90;
const TOWER_PANEL_TOP = CANVAS_HEIGHT - TOWER_PANEL_HEIGHT;
const TOWER_SHORTCUT_ORDER = ['basic', 'slow', 'area'];
const TOWER_COST = {
  basic: TOWER_TYPES.basic.cost,
  slow: TOWER_TYPES.slow.cost,
  area: TOWER_TYPES.area.cost
};

// --- 地标 ---
const LANDMARK_MAX_HP = 100;
const ENEMY_REACH_DAMAGE = 20;

// --- 关卡设置 ---
const TOTAL_LEVELS = 3;

// --- 敌人属性 ---
const ENEMY_STATS = {
  basic: { hp: 100, speed: 2,   reward: ENEMY_KILL_REWARD.basic },
  fast:  { hp:  60, speed: 3,   reward: ENEMY_KILL_REWARD.fast  },
  tank:  { hp: 300, speed: 1,   reward: ENEMY_KILL_REWARD.tank  },
  boss:  { hp: 500, speed: 0.8, reward: ENEMY_KILL_REWARD.boss  }
};

// --- 波次配置 ---
const LEVEL_1_WAVE_CONFIGS = [
  {
    waveNumber: 1,
    spawnInterval: 60,
    enemies: [
      { type: 'basic', count: 5, hp: 96, speed: 1.5 }
    ]
  },
  {
    waveNumber: 2,
    spawnInterval: 50,
    enemies: [
      { type: 'basic', count: 5, hp: 100, speed: 2 },
      { type: 'fast', count: 3, hp: 50, speed: 3 }
    ]
  },
  {
    waveNumber: 3,
    spawnInterval: 40,
    enemies: [
      { type: 'basic', count: 5, hp: 120, speed: 2 },
      { type: 'fast', count: 4, hp: 60, speed: 3.5 },
      { type: 'tank', count: 3, hp: 300, speed: 1 }
    ]
  }
];
