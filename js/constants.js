// ========================================
// 🎮 保卫英国 — 全局常量配置
// ========================================

// --- 画布设置 ---
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const FPS = 60;
const HUD_HEIGHT = 45;  // 顶部 HUD 栏高度，此区域不可放塔

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
const INITIAL_GOLD = 350;
const ENEMY_KILL_REWARD = {      // 击杀奖励
  basic: 20,
  fast: 25,
  tank: 40,
  boss: 50
};
const WAVE_CLEAR_BONUS_GOLD = 50;
const WAVE_BONUS_DISPLAY_FRAMES = 120; // 2 seconds @ 60 FPS

// --- 塔类型配置（统一集中管理） ---
const TOWER_TYPES = {
  basic: {
    name: "Basic Tower",
    cost: 50,
    range: 150,       // increased from 100 — wider path coverage
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
    range: 130,       // increased from 90 — wider path coverage
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
    range: 200,         // increased from 130 — AOE coverage for wide paths
    damage: 12,         // reduced from 15 — balance offset for larger range
    fireRate: 90,
    bulletSpeed: 10,    // 2× faster than basic/slow
    color: [220, 80, 60],
    description: "Damages all enemies in range.",
    bulletColor: [255, 150, 50],
    size: 22,
    splashRadius: 120,  // increased from 60
    areaPulseDuration: 9  // halved from 18 — faster pulse animation
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

// --- 地标（被保护的建筑） ---
const LANDMARK_MAX_HP = 100;      // 地标总血量
const ENEMY_REACH_DAMAGE = 20;    // 怪物到达终点扣 1 滴血

// --- 关卡设置 ---
const TOTAL_LEVELS = 3;

// --- 敌人属性 ---
const ENEMY_STATS = {
  basic: { hp: 100, speed: 2,   reward: ENEMY_KILL_REWARD.basic },
  fast:  { hp:  60, speed: 3,   reward: ENEMY_KILL_REWARD.fast  },
  tank:  { hp: 300, speed: 1,   reward: ENEMY_KILL_REWARD.tank  }, // increased from 250
  boss:  { hp: 500, speed: 0.8, reward: ENEMY_KILL_REWARD.boss  }
};

// --- 波次配置（统一集中管理） ---
const LEVEL_1_WAVE_CONFIGS = [
  {
    waveNumber: 1,
    spawnInterval: 60,
    enemies: [
      { type: 'basic', count: 5, hp: 96, speed: 1.5 } // hp +20% (was 80)
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
      { type: 'tank', count: 3, hp: 300, speed: 1 } // hp increased from 250
    ]
  }
];
