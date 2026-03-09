let game;
let _bgImage, _settingsBgImg;
let gameImages = {};
let canvas;  // 画布引用，用于聚焦以接收键盘事件

// 缩放相关变量
let scaleFactor = 1;
let canvasWidth, canvasHeight;

function preload() {
  _bgImage = loadImage('assets/magic_background.png');
  _settingsBgImg = loadImage('assets/PNG/panelInset_brown.png');
  gameImages.mainBackground = loadImage('assets/main_background.png');
  gameImages.btnStart = loadImage('assets/start.png',
    () => console.log('✅ start.png loaded'),
    () => console.log('❌ start.png FAILED')
  );
  gameImages.btnSettings = loadImage('assets/settings.png',
    () => console.log('✅ settings.png loaded'),
    () => console.log('❌ settings.png FAILED')
  );
  gameImages.btnExit = loadImage('assets/exit.png',
    () => console.log('✅ exit.png loaded'),
    () => console.log('❌ exit.png FAILED')
  );

  gameImages.levelSelectBg = loadImage('assets/level_selection.JPG',
    () => console.log('✅ level_selection.JPG loaded'),
    () => console.log('❌ level_selection.JPG FAILED')
  );
  gameImages.bigben          = loadImage('assets/bigben.png');
  gameImages.gherkin         = loadImage('assets/gherkin.png');
  gameImages.towerBasic      = loadImage('assets/tower_basic.png');
  gameImages.towerBasicFire  = loadImage('assets/tower_basic_fire.png');
  gameImages.towerSlow       = loadImage('assets/tower_slow.png');
  gameImages.towerSlowActive = loadImage('assets/tower_slow_active.png');
  gameImages.towerAreaFire   = loadImage('assets/tower_area_fire.png');
  // 水晶塔图片
  gameImages.towerCrystal   = loadImage('assets/tower3.png',
    () => console.log('✅ tower3.png loaded'),
    () => console.log('❌ tower3.png FAILED')
  );
  gameImages.towerCrystalActive = loadImage('assets/tower3_active.png',
    () => console.log('✅ tower3_active.png loaded'),
    () => console.log('❌ tower3_active.png FAILED')
  );
  gameImages.enemyGuard      = loadImage('assets/enemy_guard.png');
  gameImages.enemyPigeon     = loadImage('assets/enemy_pigeon.png');
  gameImages.enemyHedgehog   = loadImage('assets/enemy_hedgehog.png');
  gameImages.mapLevel1       = loadImage('assets/map_bg_level1.png');
  // Level 2 地图背景（assets 中为 level2_map.png；若使用 map_bg_level2.png 请修改路径）
  gameImages.mapLevel2       = loadImage('assets/level2_map.png',
    () => console.log('✅ level2_map.png loaded'),
    () => console.log('❌ level2_map.png FAILED')
  );
  // Level 3 地图背景（注意文件名大小写）
  gameImages.mapLevel3       = loadImage('assets/level3_map.png',
    () => console.log('✅ level3_map.png loaded'),
    () => console.log('❌ level3_map.png FAILED')
  );
  // Level 2 新怪物素材（assets 中为 monster1.png 等小写）
  gameImages.monster1        = loadImage('assets/monster1.png',
    () => console.log('✅ monster1.png loaded'),
    () => console.log('❌ monster1.png FAILED')
  );
  gameImages.monster2        = loadImage('assets/monster2.png',
    () => console.log('✅ monster2.png loaded'),
    () => console.log('❌ monster2.png FAILED')
  );
  gameImages.monster3        = loadImage('assets/monster3.png',
    () => console.log('✅ monster3.png loaded'),
    () => console.log('❌ monster3.png FAILED')
  );
  gameImages.monster4        = loadImage('assets/monster4.png',
    () => console.log('✅ monster4.png loaded'),
    () => console.log('❌ monster4.png FAILED')
  );
  // Level 3 新塔图片
  gameImages.towerSteam = loadImage('assets/tower_steam.png',
    () => console.log('✅ tower_steam.png loaded'),
    () => console.log('❌ tower_steam.png FAILED')
  );
  gameImages.towerSteamFire = loadImage('assets/tower_steam_fire.png',
    () => console.log('✅ tower_steam_fire.png loaded'),
    () => console.log('❌ tower_steam_fire.png FAILED')
  );
  gameImages.towerAlchemist = loadImage('assets/tower_alchemist.png',
    () => console.log('✅ tower_alchemist.png loaded'),
    () => console.log('❌ tower_alchemist.png FAILED')
  );
  gameImages.towerAlchemistFire = loadImage('assets/tower_alchemist_fire.png',
    () => console.log('✅ tower_alchemist_fire.png loaded'),
    () => console.log('❌ tower_alchemist_fire.png FAILED')
  );
  // Level 3 新怪物图片
  gameImages.goblinBomber = loadImage('assets/goblin_bomber.png',
    () => console.log('✅ goblin_bomber.png loaded'),
    () => console.log('❌ goblin_bomber.png FAILED')
  );
  gameImages.divingLizard = loadImage('assets/diving_lizard.png',
    () => console.log('✅ diving_lizard.png loaded'),
    () => console.log('❌ diving_lizard.png FAILED')
  );
  gameImages.treantMage = loadImage('assets/treant_mage.png',
    () => console.log('✅ treant_mage.png loaded'),
    () => console.log('❌ treant_mage.png FAILED')
  );
  gameImages.gentlemanBug = loadImage('assets/gentleman_bug.png',
    () => console.log('✅ gentleman_bug.png loaded'),
    () => console.log('❌ gentleman_bug.png FAILED')
  );
  gameImages.englandShield   = loadImage('assets/ui_england_shield.png');
  gameImages.panelBottom     = loadImage('assets/ui_panel_bottom.png');
}

function setup() {
  // 计算适合屏幕的缩放比例
  let maxWidth = windowWidth;
  let maxHeight = windowHeight;

  let scaleX = maxWidth / DESIGN_WIDTH;
  let scaleY = maxHeight / DESIGN_HEIGHT;
  scaleFactor = Math.min(scaleX, scaleY, 1);

  canvasWidth = Math.floor(DESIGN_WIDTH * scaleFactor);
  canvasHeight = Math.floor(DESIGN_HEIGHT * scaleFactor);

  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.elt.tabIndex = 0;  // 使画布可聚焦，确保键盘事件生效
  canvas.elt.style.outline = 'none';
  frameRate(FPS);

  console.log(`Screen: ${windowWidth}x${windowHeight}`);
  console.log(`Canvas: ${canvasWidth}x${canvasHeight}`);
  console.log(`Scale: ${scaleFactor.toFixed(3)}`);
  console.log(`Design: ${DESIGN_WIDTH}x${DESIGN_HEIGHT}`);
  console.log(`Grid: ${COLS} cols × ${ROWS} rows, GRID_SIZE=${GRID_SIZE}`);
  console.log(`Grid coverage: ${COLS * GRID_SIZE}x${ROWS * GRID_SIZE} (should equal design size)`);

  game = new GameManager();
  game.ui.bgImage = _bgImage;
  game.ui.settingsBgImg = _settingsBgImg;
  game.ui.setupUI();

  console.log("Game initialised");
}

function getGameMouseX() {
  return mouseX / scaleFactor;
}

function getGameMouseY() {
  return mouseY / scaleFactor;
}

function draw() {
  push();
  scale(scaleFactor);
  game.update();
  game.render();
  pop();
}

function mousePressed() {
  // 点击画布时获取焦点，确保 E/M 等按键能响应
  if (canvas && canvas.elt) {
    canvas.elt.focus();
  }
  let mx = getGameMouseX();
  let my = getGameMouseY();
  game.handleClick(mx, my);
}

function mouseDragged() {
  let mx = getGameMouseX();
  let my = getGameMouseY();
  game.handleMouseDrag(mx, my);
}

function mouseReleased() {
  game.handleMouseUp();
}

function keyPressed() {
  // 路径编辑模式快捷键（仅在 PLAYING 状态下）
  if (game && game.getState() === GameState.PLAYING && game.pathEditMode) {
    if (key === 'z' || key === 'Z') {
      if (game.pathPoints.length > 0) {
        let removed = game.pathPoints.pop();
        console.log(`↩️ 撤销路径点: col=${removed.col}, row=${removed.row}`);
      }
      return false;
    }
    if (key === 'e' || key === 'E') {
      game.exportPathCode();
      return false;
    }
    if (key === 'n' || key === 'N') {
      game.togglePathEditMode();
      return false;
    }
  }

  // E 键导出 - 地图编辑模式下
  if (game && (key === 'e' || key === 'E') && game.mapEditMode) {
    console.log('按下 E 键，正在导出...');
    game.exportGridCode();
    return false;
  }

  // M 键切换地图编辑模式 - 仅在游戏中有效
  if (game && (key === 'm' || key === 'M') && game.getState() === GameState.PLAYING) {
    game.toggleMapEditMode();
    return false;
  }

  if (key === 'd' || key === 'D') {
    game.toggleDebugMode();
    return;
  }

  let state = game.getState();

  if (state === GameState.MENU) {
    if (key === 's' || key === 'S') game.setState(GameState.LEVEL_SELECT);
    return;
  }
  if (state === GameState.LEVEL_SELECT) {
    if (key === '1') game.startLevel(1);
    if (key === '2') game.startLevel(2);
    if (key === '3') game.startLevel(3);
    if (key === 'b' || key === 'B' || key === 'Escape') {
      game.setState(GameState.MENU);
    }
    return;
  }
  if (state === GameState.PLAYING) {
    // N 键进入路径编辑模式
    if (key === 'n' || key === 'N') {
      game.togglePathEditMode();
      return;
    }
    if (key === '1') game.setSelectedTowerType('basic');
    if (key === '2') game.setSelectedTowerType('slow');
    if (key === '3') game.setSelectedTowerType('area');
    if (key === '4') game.setSelectedTowerType('crystal');
    if (key === '5') game.setSelectedTowerType('steam');
    if (key === '6') game.setSelectedTowerType('alchemist');
    if (key === 'p' || key === 'P') game.pause();
    if (key === 'r' || key === 'R') game.restart();
    if (key === 't' || key === 'T') {
      if (game.landmark) {
        game.landmark.takeDamage(ENEMY_REACH_DAMAGE);
        game.checkWinLose();
      }
    }
    return;
  }
  if (state === GameState.PAUSED) {
    if (key === 'p' || key === 'P') game.resume();
    if (key === 'r' || key === 'R') game.restart();
    return;
  }
  if (state === GameState.SETTINGS) {
    if (key === 'b' || key === 'B') game.setState(GameState.MENU);
    return;
  }
  if (state === GameState.WIN) {
    if (key === 'n' || key === 'N') game.nextLevel();
    if (key === 'r' || key === 'R') game.restart();
    return;
  }
  if (state === GameState.LOSE) {
    if (key === 'r' || key === 'R') game.restart();
    return;
  }
}

function windowResized() {
  let scaleX = windowWidth / DESIGN_WIDTH;
  let scaleY = windowHeight / DESIGN_HEIGHT;
  scaleFactor = Math.min(scaleX, scaleY, 1);

  canvasWidth = Math.floor(DESIGN_WIDTH * scaleFactor);
  canvasHeight = Math.floor(DESIGN_HEIGHT * scaleFactor);

  resizeCanvas(canvasWidth, canvasHeight);
  console.log(`Resized - Scale: ${scaleFactor.toFixed(3)}`);
}
