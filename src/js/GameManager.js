// ========================================
// GameManager — Core game loop & state coordinator
// ========================================

class GameManager {
  constructor() {
    this.state = GameState.MENU;
    this.currentLevel = 1;

    this.economy = null;
    this.landmark = null;
    this.towers = [];
    this.enemies = [];

    this.levelConfigs = {
      1: {
        name: "Level 1 — Big Ben",
        landmarkName: "Big Ben",
        landmarkHp: LANDMARK_MAX_HP,
        landmarkX: CANVAS_WIDTH - 100,
        landmarkY: CANVAS_HEIGHT / 2,
        initialGold: INITIAL_GOLD,
        totalWaves: 5
      },
      2: {
        name: "Level 2 — Tower Bridge",
        landmarkName: "Tower Bridge",
        landmarkHp: LANDMARK_MAX_HP + 5,
        landmarkX: CANVAS_WIDTH - 100,
        landmarkY: CANVAS_HEIGHT / 2,
        initialGold: INITIAL_GOLD + 50,
        totalWaves: 8
      },
      3: {
        name: "Level 3 — Buckingham Palace",
        landmarkName: "Buckingham Palace",
        landmarkHp: LANDMARK_MAX_HP + 10,
        landmarkX: CANVAS_WIDTH - 100,
        landmarkY: CANVAS_HEIGHT / 2,
        initialGold: INITIAL_GOLD + 100,
        totalWaves: 10
      }
    };

    console.log("GameManager initialised");
  }

  // --- State ---

  getState() {
    return this.state;
  }

  setState(newState) {
    console.log(`State: ${this.state} -> ${newState}`);
    this.state = newState;
  }

  // --- Level management ---

  startLevel(levelId) {
    let config = this.levelConfigs[levelId];
    if (!config) {
      console.log(`Level ${levelId} does not exist`);
      return;
    }

    console.log(`Starting: ${config.name}`);

    this.currentLevel = levelId;
    this.economy = new Economy(config.initialGold);
    this.landmark = new Landmark(
      config.landmarkName,
      config.landmarkHp,
      config.landmarkX,
      config.landmarkY
    );
    this.towers = [];
    this.enemies = [];
    this.setState(GameState.PLAYING);
  }

  // --- Per-frame update ---

  update() {
    if (this.state !== GameState.PLAYING) return;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      let enemy = this.enemies[i];
      enemy.update();

      if (enemy.reachedEnd()) {
        this.landmark.takeDamage(ENEMY_REACH_DAMAGE);
        this.enemies.splice(i, 1);
        continue;
      }

      if (enemy.isDead()) {
        this.economy.addGold(enemy.reward);
        this.enemies.splice(i, 1);
      }
    }

    for (let tower of this.towers) {
      tower.update(this.enemies);
    }

    this.checkWinLose();
  }

  checkWinLose() {
    if (this.landmark && this.landmark.isDestroyed()) {
      console.log("Landmark destroyed — GAME OVER");
      this.setState(GameState.LOSE);
    }
  }

  // --- Rendering ---

  render() {
    switch (this.state) {
      case GameState.MENU:
        this.drawMenu();
        break;
      case GameState.PLAYING:
        this.drawGame();
        break;
      case GameState.PAUSED:
        this.drawGame();       
        this.drawPaused();    
        break;
      case GameState.WIN:
        this.drawGame();      
        this.drawWin();        
        break;
      case GameState.LOSE:
        this.drawGame();      
        this.drawLose();       
        break;
    }
}


  drawGame() {
    background(34, 139, 34);

    // Grid lines
    stroke(30, 120, 30);
    strokeWeight(1);
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      line(x, 0, x, CANVAS_HEIGHT);
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      line(0, y, CANVAS_WIDTH, y);
    }
    noStroke();

    for (let tower of this.towers) {
      tower.draw();
    }

    for (let enemy of this.enemies) {
      enemy.draw();
    }

    if (this.landmark) {
      this.landmark.draw();
    }

    this.drawHUD();
  }

  drawHUD() {
    fill(0, 0, 0, 180);
    noStroke();
    rect(0, 0, CANVAS_WIDTH, 50);

    fill(255);
    textSize(20);
    textAlign(LEFT, CENTER);

    let gold = this.economy ? this.economy.getGold() : 0;
    text("Gold: " + gold, 20, 25);

    if (this.landmark) {
      let hpPercent = this.landmark.getHpPercent();
      if (hpPercent > 0.6) fill(100, 255, 100);
      else if (hpPercent > 0.3) fill(255, 255, 100);
      else fill(255, 100, 100);
      text(this.landmark.name + ": " + this.landmark.hp + "/" + this.landmark.maxHp, 250, 25);
    }

    fill(255);
    text("Level: " + this.currentLevel, 550, 25);

    text("Enemies: " + this.enemies.length, 750, 25);

    textSize(14);
    fill(180);
    text("T=damage  P=pause  R=restart", 950, 25);
  }

  // --- Player actions ---

  handleClick(mx, my) {
    // ===== 主菜单状态：点击开始按钮 =====
    if (this.state === GameState.MENU) {
      // 检查是否点击了"START GAME"按钮
      let btnX = CANVAS_WIDTH / 2;
      let btnY = CANVAS_HEIGHT / 2 + 40;
      let btnW = 280;
      let btnH = 60;

      if (mx > btnX - btnW/2 && mx < btnX + btnW/2 &&
          my > btnY - btnH/2 && my < btnY + btnH/2) {
        this.startLevel(1);
      }
      return;
    }

    // ===== 游戏中：点击放塔 =====
    if (this.state === GameState.PLAYING) {
      // 不允许在 HUD 区域放塔（顶部 50 像素）
      if (my < 50) return;

      // 不允许在地标附近放塔
      if (this.landmark) {
        let d = dist(mx, my, this.landmark.x, this.landmark.y);
        if (d < 80) return;
      }

      // 把鼠标坐标对齐到网格中心
      let gridX = Math.floor(mx / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
      let gridY = Math.floor(my / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;

      // 检查这个位置是否已经有塔了
      for (let tower of this.towers) {
        if (tower.x === gridX && tower.y === gridY) {
          console.log("❌ This spot is already occupied!");
          return;
        }
      }

      this.tryPlaceTower('basic', gridX, gridY);
      return;
    }

    // ===== 胜利/失败状态：点击任意位置重新开始 =====
    if (this.state === GameState.WIN || this.state === GameState.LOSE) {
      this.restart();
      return;
    }
  }


  tryPlaceTower(towerType, x, y) {
    let cost = TOWER_COST[towerType];
    if (!cost) {
      console.log(`Unknown tower type: ${towerType}`);
      return false;
    }

    if (!this.economy.canAfford(cost)) {
      console.log(`Not enough gold! Need ${cost}, have ${this.economy.getGold()}`);
      return false;
    }

    this.economy.spendGold(cost);

    let tower = new Tower(x, y, towerType);
    this.towers.push(tower);
    console.log(`Placed ${towerType} tower at (${x}, ${y})`);
    return true;
  }

  pause() {
    if (this.state === GameState.PLAYING) {
      this.setState(GameState.PAUSED);
    }
  }

  resume() {
    if (this.state === GameState.PAUSED) {
      this.setState(GameState.PLAYING);
    }
  }

  restart() {
    this.startLevel(this.currentLevel);
  }

  nextLevel() {
    if (this.currentLevel < TOTAL_LEVELS) {
      this.startLevel(this.currentLevel + 1);
    } else {
      console.log("All levels complete!");
      this.setState(GameState.MENU);
    }
  }

  // ========================================
  // 🎨 主菜单画面
  // ========================================
  drawMenu() {
    // 深绿色背景
    background(20, 60, 20);

    // 游戏标题
    fill(255, 215, 0);              // 金色
    textAlign(CENTER, CENTER);
    textSize(72);
    text("DEFEND BRITAIN", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    // 英国旗帜 emoji
    textSize(48);
    text("🇬🇧", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 - 80);

    // 副标题
    fill(200, 200, 200);
    textSize(24);
    text("Protect the British Landmarks!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 60);

    // 开始按钮区域
    let btnX = CANVAS_WIDTH / 2;
    let btnY = CANVAS_HEIGHT / 2 + 40;
    let btnW = 280;
    let btnH = 60;

    // 鼠标悬停效果
    let hovering = mouseX > btnX - btnW/2 && mouseX < btnX + btnW/2 &&
                   mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2;

    // 按钮背景
    if (hovering) {
      fill(50, 150, 50);            // 悬停时亮绿色
      cursor(HAND);                 // 鼠标变成手指
    } else {
      fill(34, 100, 34);            // 普通深绿色
      cursor(ARROW);
    }
    stroke(255, 215, 0);            // 金色边框
    strokeWeight(3);
    rectMode(CENTER);
    rect(btnX, btnY, btnW, btnH, 10);  // 圆角矩形

    // 按钮文字
    noStroke();
    fill(255);
    textSize(28);
    text("▶  START GAME", btnX, btnY);

    // 底部提示
    fill(120);
    textSize(16);
    text("Press 1, 2, 3 to select level", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);

    // 团队信息
    fill(80);
    textSize(14);
    text("2026 Group 14 — University of Bristol", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);

    rectMode(CORNER);  // 重置
  }

    // ========================================
  // 🏆 胜利画面
  // ========================================
  drawWin() {

    // 半透明黑色遮罩
    fill(0, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 胜利文字
    fill(255, 215, 0);              // 金色
    textAlign(CENTER, CENTER);
    textSize(80);
    text("VICTORY!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    // 星星装饰
    textSize(48);
    text("⭐ ⭐ ⭐", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 70);

    // 统计信息
    fill(255);
    textSize(24);
    let gold = this.economy ? this.economy.getGold() : 0;
    text("Remaining Gold: " + gold, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    text("Landmark HP: " + this.landmark.hp + "/" + this.landmark.maxHp,
         CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65);

    // 操作提示
    fill(200);
    textSize(20);
    text("Press N → Next Level    Press R → Replay", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
  }

  // ========================================
  // 💀 失败画面
  // ========================================
  drawLose() {

    // 半透明红色遮罩
    fill(100, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 失败文字
    fill(255, 50, 50);
    textAlign(CENTER, CENTER);
    textSize(80);
    text("DEFEATED!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    // 地标被摧毁提示
    textSize(32);
    fill(255, 150, 150);
    let landmarkName = this.landmark ? this.landmark.name : "Landmark";
    text(landmarkName + " has fallen...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 70);

    // 操作提示
    fill(200);
    textSize(20);
    text("Press R → Retry", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
  }

  // ========================================
  // ⏸️ 暂停画面
  // ========================================
  drawPaused() {
    // 半透明黑色遮罩
    fill(0, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 暂停文字
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(64);
    text("⏸  PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    // 操作提示
    fill(200);
    textSize(20);
    text("Press P → Resume    Press R → Restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  }


}
