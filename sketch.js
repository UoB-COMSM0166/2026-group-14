let game;
let _bgImage, _settingsBgImg;
let gameImages = {};

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

  gameImages.bigben          = loadImage('assets/bigben.png');
  gameImages.gherkin         = loadImage('assets/gherkin.png');
  gameImages.towerBasic      = loadImage('assets/tower_basic.png');
  gameImages.towerBasicFire  = loadImage('assets/tower_basic_fire.png');
  gameImages.towerSlow       = loadImage('assets/tower_slow.png');
  gameImages.towerSlowActive = loadImage('assets/tower_slow_active.png');
  gameImages.towerAreaFire   = loadImage('assets/tower_area_fire.png');
  gameImages.enemyGuard      = loadImage('assets/enemy_guard.png');
  gameImages.enemyPigeon     = loadImage('assets/enemy_pigeon.png');
  gameImages.enemyHedgehog   = loadImage('assets/enemy_hedgehog.png');
  gameImages.mapLevel1       = loadImage('assets/map_bg_level1.png');
  gameImages.englandShield   = loadImage('assets/ui_england_shield.png');
  gameImages.panelBottom     = loadImage('assets/ui_panel_bottom.png');
}

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  frameRate(FPS);
  game = new GameManager();
  game.ui.bgImage = _bgImage;
  game.ui.settingsBgImg = _settingsBgImg;
  game.ui.setupUI();
  console.log("Game initialised");
}

function draw() {
  game.update();
  game.render();
}

function mousePressed() {
  game.handleClick(mouseX, mouseY);
}

function keyPressed() {
  let state = game.getState();

  // 'D' toggles debug grid overlay in any game state
  if (key === 'd' || key === 'D') {
    game.toggleDebugMode();
    return;
  }

  if (state === GameState.MENU) {
    if (key === '1') game.startLevel(1);
    if (key === '2') game.startLevel(2);
    if (key === '3') game.startLevel(3);
    return;
  }
  if (state === GameState.PLAYING) {
    if (key === '1') game.setSelectedTowerType('basic');
    if (key === '2') game.setSelectedTowerType('slow');
    if (key === '3') game.setSelectedTowerType('area');
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
