let game;

function preload() {
 
}

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  frameRate(FPS);
  game = new GameManager();
  console.log("Game initialised");
}

function draw() {
  let state = game.getState();

  if (state === GameState.MENU) {
    game.drawMenu();
  } else if (state === GameState.PLAYING) {
    game.update();
    game.render();
  } else if (state === GameState.PAUSED) {
    game.render();
    game.drawPaused();
  } else if (state === GameState.WIN) {
    game.drawWin();
  } else if (state === GameState.LOSE) {
    game.drawLose();
  }
}

function mousePressed() {
  game.handleClick(mouseX, mouseY);
}

function keyPressed() {
  let state = game.getState();

  // ===== 主菜单状态 =====
  if (state === GameState.MENU) {
    // 数字键选关
    if (key === '1') game.startLevel(1);
    if (key === '2') game.startLevel(2);
    if (key === '3') game.startLevel(3);
    return;
  }

  // ===== 游戏中状态 =====
  if (state === GameState.PLAYING) {
    if (key === 'p' || key === 'P') game.pause();
    if (key === 'r' || key === 'R') game.restart();
    if (key === 't' || key === 'T') {
      // 测试用：模拟地标受到伤害
      if (game.landmark) {
        game.landmark.takeDamage(ENEMY_REACH_DAMAGE);
        game.checkWinLose();
      }
    }
    return;
  }

  // ===== 暂停状态 =====
  if (state === GameState.PAUSED) {
    if (key === 'p' || key === 'P') game.resume();
    if (key === 'r' || key === 'R') game.restart();
    return;
  }

  // ===== 胜利状态 =====
  if (state === GameState.WIN) {
    if (key === 'n' || key === 'N') game.nextLevel();
    if (key === 'r' || key === 'R') game.restart();
    return;
  }

  // ===== 失败状态 =====
  if (state === GameState.LOSE) {
    if (key === 'r' || key === 'R') game.restart();
    return;
  }
}

