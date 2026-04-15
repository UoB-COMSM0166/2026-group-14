// Global constants

// Grid configuration — default cell size and logical map dimensions
const GRID_SIZE = 60;
const COLS = 32;
const ROWS = 15;
const DESIGN_WIDTH = COLS * GRID_SIZE;   // 32 × 60 = 1920
const DESIGN_HEIGHT = ROWS * GRID_SIZE;  // 15 × 60 = 900

// Active grid settings (can be modified during debug; reset from LEVEL_GRID_CONFIG on load)
let GRID_OFFSET_X = 0;
let GRID_OFFSET_Y = 0;
let CURRENT_GRID_SIZE = GRID_SIZE;

// Per-level grid alignment (offset + cell size per map)
const LEVEL_GRID_CONFIG = {
  1: { offsetX: -2, offsetY:-16, gridSize: 60 },
  2: { offsetX: 0, offsetY: 0, gridSize: 58 },  
  3: { offsetX: -5, offsetY: -15, gridSize: 60 }
};

function applyLevelGridConfig(level) {
  let config = LEVEL_GRID_CONFIG[level];
  if (config) {
    GRID_OFFSET_X = config.offsetX;
    GRID_OFFSET_Y = config.offsetY;
    CURRENT_GRID_SIZE = config.gridSize;
  } else {
    GRID_OFFSET_X = 0;
    GRID_OFFSET_Y = 0;
    CURRENT_GRID_SIZE = GRID_SIZE;
  }
  console.log('[Grid] Level ' + level + ' loaded: offset=(' + GRID_OFFSET_X + ',' + GRID_OFFSET_Y + '), size=' + CURRENT_GRID_SIZE);
}

function pixelToCol(x) {
  return Math.floor((x - GRID_OFFSET_X) / CURRENT_GRID_SIZE);
}
function pixelToRow(y) {
  return Math.floor((y - GRID_OFFSET_Y) / CURRENT_GRID_SIZE);
}
function colToCenterX(col) {
  return GRID_OFFSET_X + col * CURRENT_GRID_SIZE + CURRENT_GRID_SIZE / 2;
}
function rowToCenterY(row) {
  return GRID_OFFSET_Y + row * CURRENT_GRID_SIZE + CURRENT_GRID_SIZE / 2;
}
function colToLeftX(col) {
  return GRID_OFFSET_X + col * CURRENT_GRID_SIZE;
}
function rowToTopY(row) {
  return GRID_OFFSET_Y + row * CURRENT_GRID_SIZE;
}
const CANVAS_WIDTH = DESIGN_WIDTH;
const CANVAS_HEIGHT = DESIGN_HEIGHT;
const FPS = 60;
const HUD_HEIGHT = 45;

const GameState = {
  MENU: 'menu',
  LOGIN: 'login',
  LEVEL_SELECT: 'level_select',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WIN: 'win',
  LOSE: 'lose',
  SETTINGS: 'settings',
  IN_GAME_SETTINGS: 'in_game_settings',
  MONSTER_INFO: 'monster_info',
  INSTRUCTIONS: 'instructions'
};

// Tutorial steps — highlightArea tuned for Level 1 (design canvas 1920×900)
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    highlight: 'none',
    title: 'Welcome!',
    message: 'This is a Tower Defense game. Let me show you how to play!',
    position: 'center'
  },
  {
    id: 'landmark',
    highlight: 'landmark',
    highlightArea: { x: 1602, y: 100, w: 314, h: 402 },
    title: 'Your Goal',
    message: 'Protect the Landmark! Keep its health above 0 until all enemy waves are defeated.',
    position: 'left'
  },
  {
    id: 'path',
    highlight: 'path',
    highlightArea: { x: 5, y: 41, w: 1903, h: 770 },
    title: 'Enemy Path',
    message: 'Enemies will spawn and follow this path toward your Landmark.',
    position: 'top'
  },
  {
    id: 'tower_panel',
    highlight: 'tower_panel',
    highlightArea: { x: 8, y: 811, w: 1904, h: 92 },
    title: 'Tower Selection',
    message: 'Select a tower type here. Each tower has different abilities and costs.',
    position: 'top'
  },
  {
    id: 'buildable',
    highlight: 'buildable',
    highlightArea: { x: 0, y: 42, w: 1911, h: 762 },
    title: 'Build Towers',
    message: 'Click on the green highlighted areas to place your selected tower.',
    position: 'center'
  },
  {
    id: 'gold',
    highlight: 'gold',
    highlightArea: { x: 238, y: 817, w: 117, h: 83 },
    title: 'Gold',
    message: 'Building towers costs gold. Kill enemies to earn more gold!',
    position: 'top'
  },
  {
    id: 'lives',
    highlight: 'lives',
    highlightArea: { x: 746, y: 5, w: 448, h: 37 },
    title: 'Lives',
    message: 'You lose a life when an enemy reaches the Landmark. Game over when lives reach 0!',
    position: 'left'
  },
  {
    id: 'ready',
    highlight: 'none',
    title: 'Ready to Play!',
    message: 'Now try it yourself! Build towers and defend your Landmark. Good luck!',
    position: 'center'
  }
];

// Enemies available in each level (only enemies with images)
const LEVEL_ENEMIES = {
  1: ['basic', 'fast', 'tank'],
  2: ['basic', 'fast', 'tank', 'knight', 'archer', 'giant'],
  3: ['basic', 'fast', 'tank', 'knight', 'archer', 'giant', 'goblinBomber', 'divingLizard', 'treantMage', 'gentlemanBug']
};

// Enemy display information
const ENEMY_INFO = {
  basic: {
    name: 'Guard',
    description: 'Standard enemy',
    ability: 'None'
  },
  fast: {
    name: 'Pigeon',
    description: 'Fast but weak',
    ability: 'High speed'
  },
  tank: {
    name: 'Hedgehog',
    description: 'Slow but tanky',
    ability: 'High HP'
  },
  knight: {
    name: 'Knight',
    description: 'Armored warrior',
    ability: 'Charge: 2.5x speed at low HP'
  },
  archer: {
    name: 'Archer',
    description: 'Agile attacker',
    ability: 'Dodge: 25% evade'
  },
  giant: {
    name: 'Giant',
    description: 'Massive creature',
    ability: 'Leap: Jump every 5s'
  },
  goblinBomber: {
    name: 'Goblin Bomber',
    description: 'Explosive enemy',
    ability: 'Explode: Disable towers'
  },
  divingLizard: {
    name: 'Diving Lizard',
    description: 'Aquatic creature',
    ability: 'Dive: Immune 3s'
  },
  treantMage: {
    name: 'Treant Mage',
    description: 'Nature healer',
    ability: 'Heal: 5% to nearby'
  },
  gentlemanBug: {
    name: 'Gentleman Bug',
    description: 'Multi-phase boss',
    ability: 'Summon/Shield/Rage'
  }
};

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
const TOWER_PANEL_HEIGHT = 120;
const TOWER_PANEL_TOP = CANVAS_HEIGHT - TOWER_PANEL_HEIGHT;
const TOWER_SHORTCUT_ORDER = ['basic', 'slow', 'area', 'crystal', 'steam', 'alchemist'];

const LEVEL_AVAILABLE_TOWERS = {
  1: ['basic', 'slow', 'area'],
  2: ['basic', 'slow', 'area', 'crystal'],
  3: ['basic', 'slow', 'area', 'crystal', 'steam', 'alchemist']
};
const TOWER_COST = {
  basic: 60,
  slow: 85,
  area: 140,
  crystal: 120,
  steam: 180,
  alchemist: 150
};

const LANDMARK_MAX_HP = 100;
const ENEMY_REACH_DAMAGE = 20;

const TOTAL_LEVELS = 3;

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

// Level 2 - River Thames Patrol
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

// Level 3 - Tower of London Siege
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
