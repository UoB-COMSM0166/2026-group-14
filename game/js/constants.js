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
  LEVEL_SELECT: 'level_select',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WIN: 'win',
  LOSE: 'lose',
  SETTINGS: 'settings'
};

// --- 经济系统 ---
const INITIAL_GOLD = 400;
const ENEMY_KILL_REWARD = {
  basic: 15,
  fast: 20,
  tank: 25,
  boss: 45,
  knight: 22,
  archer: 15,
  giant: 35,
  goblinBomber: 18,
  divingLizard: 20,
  treantMage: 28,
  gentlemanBug: 150
};
const WAVE_CLEAR_BONUS_GOLD = 60;
const WAVE_BONUS_DISPLAY_FRAMES = 120;

// --- 塔类型配置 ---
const TOWER_TYPES = {
  basic: {
    name: "Basic Tower",
    cost: 60,
    range: 150,
    damage: 30,
    fireRate: 55,
    bulletSpeed: 5,
    color: [70, 130, 230],
    description: "Balanced tower. Reliable damage.",
    bulletColor: [255, 255, 0],
    size: 18
  },
  slow: {
    name: "Slow Tower",
    cost: 85,
    range: 140,
    damage: 12,
    fireRate: 70,
    bulletSpeed: 5,
    color: [70, 200, 120],
    description: "Slows enemies. Low damage.",
    bulletColor: [100, 200, 255],
    size: 18,
    slowEffect: 0.45,
    slowDuration: 100
  },
  area: {
    name: "Area Tower",
    cost: 130,
    range: 200,
    damage: 18,
    fireRate: 85,
    bulletSpeed: 10,
    color: [220, 80, 60],
    description: "Damages all enemies in range.",
    bulletColor: [255, 150, 50],
    size: 22,
    splashRadius: 130,
    areaPulseDuration: 9
  },
  crystal: {
    name: "Crystal Tower",
    cost: 120,
    range: 160,
    damage: 15,
    fireRate: 150,
    bulletSpeed: 4,
    color: [150, 100, 255],
    description: "Slow attack. Boosts nearby towers +25% damage.",
    bulletColor: [200, 150, 255],
    size: 22,
    boostRadius: 200,
    boostDamage: 0.25,
    boostFireRate: 0.10,
    isSupport: false
  },
  steam: {
    name: "Steam Cannon",
    cost: 180,
    range: 220,
    damage: 80,
    fireRate: 200,
    bulletSpeed: 8,
    color: [180, 100, 50],
    description: "Piercing shots. Hits up to 3 enemies.",
    bulletColor: [100, 200, 255],
    size: 26,
    pierceCount: 3,
    pierceDamageDecay: 0.2,
    chargeBonus: 0.15,
    maxChargeStacks: 3
  },
  alchemist: {
    name: "Alchemist Tower",
    cost: 150,
    range: 170,
    damage: 20,
    fireRate: 70,
    bulletSpeed: 6,
    color: [50, 180, 80],
    description: "Random potion effects. May freeze or poison.",
    bulletColor: [100, 255, 100],
    size: 22,
    potionEffects: {
      explosion: { chance: 0.30, splashRadius: 80, splashDamage: 0.5 },
      poison: { chance: 0.25, damagePercent: 0.03, duration: 300 },
      freeze: { chance: 0.20, duration: 90 },
      weaken: { chance: 0.15, damageBonus: 0.3, duration: 240 },
      transform: { chance: 0.10 }
    }
  }
};
const TOWER_PANEL_HEIGHT = 90;
const TOWER_PANEL_TOP = CANVAS_HEIGHT - TOWER_PANEL_HEIGHT;
const TOWER_SHORTCUT_ORDER = ['basic', 'slow', 'area', 'crystal', 'steam', 'alchemist'];
const TOWER_COST = {
  basic: 60,
  slow: 85,
  area: 140,
  crystal: 120,
  steam: 180,
  alchemist: 150
};

// --- 地标 ---
const LANDMARK_MAX_HP = 100;
const ENEMY_REACH_DAMAGE = 20;

// --- 关卡设置 ---
const TOTAL_LEVELS = 3;

// --- 敌人属性 ---
const ENEMY_STATS = {
  basic:  { hp: 100, speed: 2,   reward: 15 },
  fast:   { hp:  60, speed: 3,   reward: 20 },
  tank:   { hp: 300, speed: 1,   reward: 25 },
  boss:   { hp: 500, speed: 0.8, reward: 45 },
  knight: {
    hp: 180,
    speed: 1.6,
    reward: 22,
    ability: 'charge',
    chargeSpeedMultiplier: 2.5,
    chargeThreshold: 0.4,
    chargeDuration: 120
  },
  archer: {
    hp: 90,
    speed: 2.2,
    reward: 15,
    ability: 'dodge',
    dodgeChance: 0.25
  },
  giant: {
    hp: 500,
    speed: 0.7,
    reward: 35,
    ability: 'leap',
    leapCooldown: 300,
    leapDistance: 1
  },
  goblinBomber: {
    hp: 120,
    speed: 2.2,
    reward: 18,
    ability: 'explode',
    explodeRadius: 150,
    disableDuration: 180
  },
  divingLizard: {
    hp: 100,
    speed: 1.8,
    reward: 20,
    ability: 'dive',
    diveCooldown: 480,
    diveDuration: 180
  },
  treantMage: {
    hp: 200,
    speed: 1.2,
    reward: 28,
    ability: 'heal',
    healRadius: 200,
    healPercent: 0.05,
    healCooldown: 180
  },
  gentlemanBug: {
    hp: 1500,
    speed: 0.5,
    reward: 150,
    ability: 'boss',
    phase2Threshold: 0.6,
    phase3Threshold: 0.3,
    summonCooldown: 600,
    tauntCooldown: 1200,
    tauntDuration: 300,
    tauntDebuff: 0.2
  }
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

// Level 2 波次配置 — River Thames Patrol
const LEVEL_2_WAVE_CONFIGS = [
  {
    waveNumber: 1,
    spawnInterval: 40,
    enemies: [
      { type: 'basic', count: 12, hp: 110, speed: 1.8 },
      { type: 'knight', count: 5, hp: 160, speed: 1.5 }
    ]
  },
  {
    waveNumber: 2,
    spawnInterval: 35,
    enemies: [
      { type: 'knight', count: 10, hp: 180, speed: 1.6 },
      { type: 'archer', count: 8, hp: 85, speed: 2.3 },
      { type: 'fast', count: 6, hp: 70, speed: 2.8 }
    ]
  },
  {
    waveNumber: 3,
    spawnInterval: 30,
    enemies: [
      { type: 'knight', count: 12, hp: 200, speed: 1.7 },
      { type: 'archer', count: 12, hp: 95, speed: 2.5 },
      { type: 'giant', count: 3, hp: 450, speed: 0.7 },
      { type: 'tank', count: 4, hp: 320, speed: 1.0 }
    ]
  },
  {
    waveNumber: 4,
    spawnInterval: 25,
    enemies: [
      { type: 'knight', count: 15, hp: 220, speed: 1.8 },
      { type: 'archer', count: 15, hp: 100, speed: 2.6 },
      { type: 'giant', count: 5, hp: 500, speed: 0.75 },
      { type: 'tank', count: 6, hp: 380, speed: 1.1 }
    ]
  },
  {
    waveNumber: 5,
    spawnInterval: 22,
    enemies: [
      { type: 'knight', count: 20, hp: 250, speed: 1.9 },
      { type: 'archer', count: 18, hp: 110, speed: 2.8 },
      { type: 'giant', count: 8, hp: 550, speed: 0.8 },
      { type: 'tank', count: 8, hp: 420, speed: 1.2 },
      { type: 'boss', count: 3, hp: 700, speed: 0.65 }
    ]
  },
  {
    waveNumber: 6,
    spawnInterval: 18,
    enemies: [
      { type: 'knight', count: 25, hp: 280, speed: 2.0 },
      { type: 'archer', count: 20, hp: 120, speed: 3.0 },
      { type: 'giant', count: 10, hp: 600, speed: 0.85 },
      { type: 'boss', count: 5, hp: 800, speed: 0.7 }
    ]
  }
];

// Level 3 波次配置 — Tower of London Siege
const LEVEL_3_WAVE_CONFIGS = [
  {
    waveNumber: 1,
    spawnInterval: 40,
    enemies: [
      { type: 'basic', count: 15, hp: 130, speed: 1.8 },
      { type: 'knight', count: 8, hp: 200, speed: 1.6 },
      { type: 'goblinBomber', count: 5, hp: 120, speed: 2.2 }
    ]
  },
  {
    waveNumber: 2,
    spawnInterval: 35,
    enemies: [
      { type: 'archer', count: 12, hp: 100, speed: 2.4 },
      { type: 'divingLizard', count: 10, hp: 100, speed: 1.8 },
      { type: 'giant', count: 4, hp: 500, speed: 0.7 }
    ]
  },
  {
    waveNumber: 3,
    spawnInterval: 30,
    enemies: [
      { type: 'knight', count: 12, hp: 220, speed: 1.7 },
      { type: 'divingLizard', count: 8, hp: 110, speed: 1.9 },
      { type: 'treantMage', count: 4, hp: 200, speed: 1.2 },
      { type: 'tank', count: 4, hp: 400, speed: 1.0 }
    ]
  },
  {
    waveNumber: 4,
    spawnInterval: 28,
    enemies: [
      { type: 'goblinBomber', count: 15, hp: 130, speed: 2.3 },
      { type: 'archer', count: 12, hp: 110, speed: 2.5 },
      { type: 'treantMage', count: 6, hp: 220, speed: 1.3 },
      { type: 'giant', count: 5, hp: 550, speed: 0.75 }
    ]
  },
  {
    waveNumber: 5,
    spawnInterval: 25,
    enemies: [
      { type: 'knight', count: 18, hp: 250, speed: 1.8 },
      { type: 'divingLizard', count: 12, hp: 120, speed: 2.0 },
      { type: 'treantMage', count: 8, hp: 240, speed: 1.3 },
      { type: 'giant', count: 6, hp: 600, speed: 0.8 }
    ]
  },
  {
    waveNumber: 6,
    spawnInterval: 22,
    enemies: [
      { type: 'knight', count: 20, hp: 280, speed: 1.9 },
      { type: 'goblinBomber', count: 15, hp: 140, speed: 2.4 },
      { type: 'divingLizard', count: 10, hp: 130, speed: 2.1 },
      { type: 'treantMage', count: 6, hp: 260, speed: 1.4 },
      { type: 'gentlemanBug', count: 2, hp: 1500, speed: 0.5 }
    ]
  }
];
