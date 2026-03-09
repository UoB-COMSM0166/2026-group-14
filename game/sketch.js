let game;
let _bgImage, _settingsBgImg;
let gameImages = {};
let canvas;

let scaleFactor = 1;
let canvasWidth, canvasHeight;

function preload() {
  _bgImage = loadImage('assets/magic_background.png');
  _settingsBgImg = loadImage('assets/PNG/panelInset_brown.png');
  gameImages.mainBackground = loadImage('assets/main_background.png');
  gameImages.btnStart = loadImage('assets/start.png',
    () => console.log('[Load] start.png loaded'),
    () => console.log('[Error] start.png failed to load')
  );
  gameImages.btnSettings = loadImage('assets/settings.png',
    () => console.log('[Load] settings.png loaded'),
    () => console.log('[Error] settings.png failed to load')
  );
  gameImages.btnExit = loadImage('assets/exit.png',
    () => console.log('[Load] exit.png loaded'),
    () => console.log('[Error] exit.png failed to load')
  );

  gameImages.levelSelectBg = loadImage('assets/level_selection.JPG',
    () => console.log('[Load] level_selection.JPG loaded'),
    () => console.log('[Error] level_selection.JPG failed to load')
  );
  gameImages.bigben          = loadImage('assets/bigben.png');
  gameImages.gherkin         = loadImage('assets/gherkin.png');
  gameImages.towerBasic      = loadImage('assets/tower_basic.png');
  gameImages.towerBasicFire  = loadImage('assets/tower_basic_fire.png');
  gameImages.towerSlow       = loadImage('assets/tower_slow.png');
  gameImages.towerSlowActive = loadImage('assets/tower_slow_active.png');
  gameImages.towerAreaFire   = loadImage('assets/tower_area_fire.png');
  gameImages.towerCrystal   = loadImage('assets/tower3.png',
    () => console.log('[Load] tower3.png loaded'),
    () => console.log('[Error] tower3.png failed to load')
  );
  gameImages.towerCrystalActive = loadImage('assets/tower3_active.png',
    () => console.log('[Load] tower3_active.png loaded'),
    () => console.log('[Error] tower3_active.png failed to load')
  );
  gameImages.enemyGuard      = loadImage('assets/enemy_guard.png');
  gameImages.enemyPigeon     = loadImage('assets/enemy_pigeon.png');
  gameImages.enemyHedgehog   = loadImage('assets/enemy_hedgehog.png');
  gameImages.mapLevel1       = loadImage('assets/map_bg_level1.png');
  gameImages.mapLevel2       = loadImage('assets/level2_map.png',
    () => console.log('[Load] level2_map.png loaded'),
    () => console.log('[Error] level2_map.png failed to load')
  );
  gameImages.mapLevel3       = loadImage('assets/level3_map.png',
    () => console.log('[Load] level3_map.png loaded'),
    () => console.log('[Error] level3_map.png failed to load')
  );
  gameImages.monster1        = loadImage('assets/monster1.png',
    () => console.log('[Load] monster1.png loaded'),
    () => console.log('[Error] monster1.png failed to load')
  );
  gameImages.monster2        = loadImage('assets/monster2.png',
    () => console.log('[Load] monster2.png loaded'),
    () => console.log('[Error] monster2.png failed to load')
  );
  gameImages.monster3        = loadImage('assets/monster3.png',
    () => console.log('[Load] monster3.png loaded'),
    () => console.log('[Error] monster3.png failed to load')
  );
  gameImages.monster4        = loadImage('assets/monster4.png',
    () => console.log('[Load] monster4.png loaded'),
    () => console.log('[Error] monster4.png failed to load')
  );
  gameImages.towerSteam = loadImage('assets/tower_steam.png',
    () => console.log('[Load] tower_steam.png loaded'),
    () => console.log('[Error] tower_steam.png failed to load')
  );
  gameImages.towerSteamFire = loadImage('assets/tower_steam_fire.png',
    () => console.log('[Load] tower_steam_fire.png loaded'),
    () => console.log('[Error] tower_steam_fire.png failed to load')
  );
  gameImages.towerAlchemist = loadImage('assets/tower_alchemist.png',
    () => console.log('[Load] tower_alchemist.png loaded'),
    () => console.log('[Error] tower_alchemist.png failed to load')
  );
  gameImages.towerAlchemistFire = loadImage('assets/tower_alchemist_fire.png',
    () => console.log('[Load] tower_alchemist_fire.png loaded'),
    () => console.log('[Error] tower_alchemist_fire.png failed to load')
  );
  gameImages.goblinBomber = loadImage('assets/goblin_bomber.png',
    () => console.log('[Load] goblin_bomber.png loaded'),
    () => console.log('[Error] goblin_bomber.png failed to load')
  );
  gameImages.divingLizard = loadImage('assets/diving_lizard.png',
    () => console.log('[Load] diving_lizard.png loaded'),
    () => console.log('[Error] diving_lizard.png failed to load')
  );
  gameImages.treantMage = loadImage('assets/treant_mage.png',
    () => console.log('[Load] treant_mage.png loaded'),
    () => console.log('[Error] treant_mage.png failed to load')
  );
  gameImages.gentlemanBug = loadImage('assets/gentleman_bug.png',
    () => console.log('[Load] gentleman_bug.png loaded'),
    () => console.log('[Error] gentleman_bug.png failed to load')
  );
  gameImages.panelBottom     = loadImage('assets/ui_panel_bottom.png');
}

function setup() {
  let maxWidth = windowWidth;
  let maxHeight = windowHeight;

  let scaleX = maxWidth / DESIGN_WIDTH;
  let scaleY = maxHeight / DESIGN_HEIGHT;
  scaleFactor = Math.min(scaleX, scaleY, 1);

  canvasWidth = Math.floor(DESIGN_WIDTH * scaleFactor);
  canvasHeight = Math.floor(DESIGN_HEIGHT * scaleFactor);

  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.elt.tabIndex = 0;
  canvas.elt.style.outline = 'none';
  frameRate(FPS);

  console.log(`[Debug] Screen: ${windowWidth}x${windowHeight}`);
  console.log(`[Debug] Canvas: ${canvasWidth}x${canvasHeight}`);
  console.log(`[Debug] Scale: ${scaleFactor.toFixed(3)}`);
  console.log(`[Debug] Design: ${DESIGN_WIDTH}x${DESIGN_HEIGHT}`);
  console.log(`[Debug] Grid: ${COLS} cols x ${ROWS} rows, GRID_SIZE=${GRID_SIZE}`);
  console.log(`[Debug] Grid coverage: ${COLS * GRID_SIZE}x${ROWS * GRID_SIZE} (should equal design size)`);

  game = new GameManager();
  game.ui.bgImage = _bgImage;
  game.ui.settingsBgImg = _settingsBgImg;
  game.ui.setupUI();

  console.log("[Game] Game initialised");
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
  if (canvas && canvas.elt) canvas.elt.focus();
  let mx = getGameMouseX();
  let my = getGameMouseY();
  game.handleClick(mx, my);
}

function mouseDragged() {
  let mx = getGameMouseX();
  let my = getGameMouseY();
  if (game.getState() === GameState.SETTINGS || game.getState() === GameState.IN_GAME_SETTINGS) {
    game.ui.handleSettingsDrag(mx, my);
    return;
  }
  game.handleMouseDrag(mx, my);
}

function mouseReleased() {
  if (game.getState() === GameState.SETTINGS || game.getState() === GameState.IN_GAME_SETTINGS) {
    game.ui.handleSettingsRelease();
  }
  game.handleMouseUp();
}

function keyPressed() {
  if (game && game.getState() === GameState.PLAYING && game.pathEditMode) {
    if (key === 'z' || key === 'Z') {
      if (game.pathPoints.length > 0) {
        let removed = game.pathPoints.pop();
        console.log(`[Editor] Undo waypoint: col=${removed.col}, row=${removed.row}`);
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

  if (game && (key === 'e' || key === 'E') && game.mapEditMode) {
    console.log('[Editor] Exporting...');
    game.exportGridCode();
    return false;
  }

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
    if (key === ' ') {
      game.manualPaused = !game.manualPaused;
      console.log(game.manualPaused ? '[Game] Game paused' : '[Game] Game resumed');
      return false;
    }
    if (keyCode === ESCAPE) {
      game.setState(GameState.IN_GAME_SETTINGS);
      return false;
    }
    if (key === 'n' || key === 'N') {
      game.togglePathEditMode();
      return;
    }
    let availableTowers = game.availableTowers || ['basic', 'slow', 'area'];
    if (key === '1' && availableTowers.length >= 1) { game.setSelectedTowerType(availableTowers[0]); return false; }
    if (key === '2' && availableTowers.length >= 2) { game.setSelectedTowerType(availableTowers[1]); return false; }
    if (key === '3' && availableTowers.length >= 3) { game.setSelectedTowerType(availableTowers[2]); return false; }
    if (key === '4' && availableTowers.length >= 4) { game.setSelectedTowerType(availableTowers[3]); return false; }
    if (key === '5' && availableTowers.length >= 5) { game.setSelectedTowerType(availableTowers[4]); return false; }
    if (key === '6' && availableTowers.length >= 6) { game.setSelectedTowerType(availableTowers[5]); return false; }
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
  if (state === GameState.IN_GAME_SETTINGS) {
    if (keyCode === ESCAPE) {
      game.setState(GameState.PLAYING);
    }
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
  console.log(`[Debug] Resized - Scale: ${scaleFactor.toFixed(3)}`);
}
