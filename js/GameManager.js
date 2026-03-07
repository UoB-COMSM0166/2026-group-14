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
    this.path = null;
    this.mapGrid = null;  // 2-D tile array — see MapData.js
    this.ui = new UIHUD(this);
    this.waveManager = null;

    this.totalKills = 0;
    this.waveSurvived = 0;
    this.finalStats = null;
    this.selectedTowerType = 'basic';

    // Prevents click-through when an HTML button callback changes state in the
    // same event that also triggers the canvas mousePressed handler.
    this.stateJustChanged = false;

    this.debugMode = false;  // toggled by 'D' key — shows tile grid overlay

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
    this.stateJustChanged = true;
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

    // Build the path for this level (defined in Path.js)
    const waypointFns = {
      1: getLevel1Waypoints,
      2: getLevel2Waypoints,
      3: getLevel3Waypoints
    };
    let waypointFn = waypointFns[levelId] || getLevel1Waypoints;
    this.path = new Path(waypointFn());

    // Build the tile grid for build-validity checks (defined in MapData.js)
    const mapDataFns = {
      1: getLevel1MapData
      // Add getLevel2MapData, getLevel3MapData here when levels are designed
    };
    let mapDataFn = mapDataFns[levelId] || getLevel1MapData;
    this.mapGrid = mapDataFn();
    console.log(`Map grid built: ${this.mapGrid[0].length} cols × ${this.mapGrid.length} rows`);

    // Build the wave manager for this level (defined in Wave.js)
    const waveFns = {
      1: getLevel1Waves,
      2: getLevel2Waves,
      3: getLevel3Waves
    };
    let waveFn = waveFns[levelId] || getLevel1Waves;
    this.waveManager = new WaveManager(waveFn());
    this.totalKills = 0;
    this.waveSurvived = 0;
    this.finalStats = null;
    this.selectedTowerType = 'basic';

    this.setState(GameState.PLAYING);
  }

  // --- Per-frame update ---

  update() {
    // Reset click-through guard each frame so normal clicks work next frame
    this.stateJustChanged = false;

    if (this.state !== GameState.PLAYING) return;

    // Wave manager runs first so newly spawned enemies are available this frame
    if (this.waveManager) {
      this.waveManager.update(this.enemies, this.path);
      if (this.waveManager.consumeWaveClearEvent()) {
        this.waveSurvived++;
        this.economy.addGold(WAVE_CLEAR_BONUS_GOLD);
        this.ui.showWaveBonus(`+${WAVE_CLEAR_BONUS_GOLD} Wave Bonus!`);
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      let enemy = this.enemies[i];
      enemy.update();

      if (enemy.reachedEnd()) {
        this.landmark.takeDamage(ENEMY_REACH_DAMAGE);
        this.enemies.splice(i, 1);
        continue;
      }

      if (enemy.isDead()) {
        this.totalKills++;
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
    if (this.state !== GameState.PLAYING) return;

    if (this.landmark && this.landmark.isDestroyed()) {
      console.log("Landmark destroyed — GAME OVER");
      if (this.waveManager) this.waveManager.stop();
      this.recordFinalStats(GameState.LOSE);
      this.setState(GameState.LOSE);
      return;
    }
    // Win: all waves spawned, and no live enemies remain on the field
    if (this.landmark && this.landmark.hp > 0 && this.waveManager && this.waveManager.allWavesComplete) {
      let liveEnemies = this.enemies.filter(e => !e.isDead() && !e.reachedEnd());
      if (liveEnemies.length === 0) {
        console.log("All waves cleared — VICTORY");
        this.recordFinalStats(GameState.WIN);
        this.setState(GameState.WIN);
      }
    }
  }

  recordFinalStats(resultState) {
    let totalWaves = this.waveManager ? this.waveManager.waves.length : 0;
    let currentGold = this.economy ? this.economy.getGold() : 0;
    let landmarkHp = this.landmark ? Math.max(0, this.landmark.hp) : 0;
    let landmarkMaxHp = this.landmark ? this.landmark.maxHp : 0;

    this.finalStats = {
      resultState,
      waveSurvived: this.waveSurvived,
      totalWaves,
      totalKills: this.totalKills,
      goldRemaining: currentGold,
      landmarkHp,
      landmarkMaxHp
    };
  }

  // --- Rendering ---

  render() {
    switch (this.state) {
      case GameState.MENU:
        this.ui.drawMainMenu();
        break;
      case GameState.PLAYING:
        this.drawGame();
        this.ui.drawHUD();
        break;
      case GameState.SETTINGS:
        this.ui.drawSettings();
        break;
      case GameState.PAUSED:
        this.drawGame();
        this.ui.drawPauseScreen();
        break;
      case GameState.WIN:
        this.drawGame();
        this.ui.drawWinScreen();
        break;
      case GameState.LOSE:
        this.drawGame();
        this.ui.drawLoseScreen();
        break;
    }
  }



  drawGame() {
    // Map background — image if available, solid colour fallback
    if (gameImages && gameImages.mapLevel1 && gameImages.mapLevel1.width > 0) {
      imageMode(CORNER);
      image(gameImages.mapLevel1, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      background(34, 139, 34);
    }

    for (let tower of this.towers) {
      tower.draw();
    }

    for (let enemy of this.enemies) {
      enemy.draw();
    }

    if (this.landmark) {
      this.landmark.draw();
    }

    if (this.state === GameState.PLAYING) {
      this.ui.drawTowerPlacementPreview();
    }

    // Debug grid overlay — drawn on top of everything except the HUD
    if (this.debugMode) {
      this.drawDebugGrid();
    }

    this.drawHUD();
  }

  // ========================================
  // 🔧 Debug grid overlay
  // ========================================

  /**
   * Single source of truth for "can the player build a tower on this grid cell?".
   * Used by: debug grid overlay, tower-placement logic, hover preview.
   *
   * @param {number} col  grid column (integer)
   * @param {number} row  grid row    (integer)
   * @returns {boolean}
   */
  canBuildAt(col, row) {
    if (!this.mapGrid) return false;

    // Out-of-bounds
    if (row < 0 || row >= this.mapGrid.length)    return false;
    if (col < 0 || col >= this.mapGrid[0].length) return false;

    // HUD 区域（y: 0 到 HUD_HEIGHT）不可放塔
    let cellCenterY = row * GRID_SIZE + GRID_SIZE / 2;
    if (cellCenterY < HUD_HEIGHT) return false;

    // Tile must be exactly GRASS
    if (this.mapGrid[row][col] !== TILE_TYPES.GRASS) return false;

    // A tower already occupies this cell
    let cx = col * GRID_SIZE + GRID_SIZE / 2;
    let cy = row * GRID_SIZE + GRID_SIZE / 2;
    if (this.towers.some(t => t.x === cx && t.y === cy)) return false;

    return true;
  }

  /**
   * Visualise the tile grid for map editing.
   * Enabled/disabled with the 'D' key (debugMode flag).
   * Does NOT affect any game logic.
   *
   * Colour key:
   *   Green = canBuildAt() → true
   *   Red   = canBuildAt() → false
   */
  drawDebugGrid() {
    if (!this.mapGrid) return;

    let rows = this.mapGrid.length;
    let cols = this.mapGrid[0].length;

    push();
    rectMode(CORNER);
    textAlign(CENTER, CENTER);

    // ── 1. Two-colour cell overlays + col,row labels ───────────────
    //   GREEN = canBuildAt() true  (matches placement logic exactly)
    //   RED   = canBuildAt() false (blocked for any reason)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let px = c * GRID_SIZE;
        let py = r * GRID_SIZE;
        let ok = this.canBuildAt(c, r);

        noStroke();
        fill(ok ? color(0, 255, 0, 77) : color(255, 0, 0, 77));
        rect(px, py, GRID_SIZE, GRID_SIZE);

        fill(255, 255, 255, 200);
        textSize(10);
        text(`${c},${r}`, px + GRID_SIZE / 2, py + GRID_SIZE / 2);
      }
    }

    // ── 2. Grid lines ──────────────────────────────────────────────
    stroke(255, 255, 255, 55);
    strokeWeight(0.5);
    for (let c = 0; c <= cols; c++) {
      line(c * GRID_SIZE, 0, c * GRID_SIZE, CANVAS_HEIGHT);
    }
    for (let r = 0; r <= rows; r++) {
      line(0, r * GRID_SIZE, CANVAS_WIDTH, r * GRID_SIZE);
    }

    // ── 3. Mouse-cell info (top-left) ─────────────────────────────
    let mCol     = Math.floor(mouseX / GRID_SIZE);
    let mRow     = Math.floor(mouseY / GRID_SIZE);
    let canBuild = this.canBuildAt(mCol, mRow);
    let rawTile  = (mRow >= 0 && mRow < rows && mCol >= 0 && mCol < cols)
      ? this.mapGrid[mRow][mCol]
      : 'OOB';
    // Decode string tile type back to the integer the user authored (0/1/2)
    const DECODE = {
      [TILE_TYPES.GRASS]: 2, [TILE_TYPES.PATH]: 1,
      [TILE_TYPES.OBSTACLE]: 0, [TILE_TYPES.OCCUPIED]: 'occ'
    };
    let mapVal = (rawTile in DECODE) ? DECODE[rawTile] : rawTile;
    let info   = `Grid: col=${mCol}, row=${mRow} | canBuild: ${canBuild} | mapValue: ${mapVal}`;

    noStroke();
    textSize(13);
    textAlign(LEFT, CENTER);
    fill(0, 0, 0, 180);
    rect(8, 54, 440, 22, 4);
    fill(canBuild ? color(80, 255, 120) : color(255, 110, 80));
    text(info, 16, 65);

    pop();
  }

  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    console.log(`Debug mode ${this.debugMode ? 'ON  ✅' : 'OFF ❌'}`);
    if (this.debugMode && !this.mapGrid) {
      console.warn('mapGrid is null — start a level first to see tile data.');
    }
  }

  drawHUD() {
    // 顶部 HUD 由 UIHUD.drawTopHUDBar / drawHUD 绘制
    // 此处保留空实现，避免与 UIHUD 重复绘制
  }

  // --- Player actions ---

  handleClick(mx, my) {
    // Guard against click-through: if state just changed this same event
    // (e.g. an HTML button callback already fired startLevel/setState),
    // drop this canvas-level click entirely.
    if (this.stateJustChanged) return;

    // ===== 主菜单状态：点击图片按钮 =====
    if (this.state === GameState.MENU) {
      this.ui.handleMenuClick(mx, my);
      return;
    }

    // ===== 游戏中：点击放塔 =====
    if (this.state === GameState.PLAYING) {
      // ── Panel / HUD click → handled first ────────────────────────
      if (this.ui.handleTowerPanelClick(mx, my)) return;
      if (my < HUD_HEIGHT) return;  // top HUD bar

      // ── Unified col/row from pixel ─────────────────────────────
      let col  = Math.floor(mx / GRID_SIZE);
      let row  = Math.floor(my / GRID_SIZE);
      let gridX = col * GRID_SIZE + GRID_SIZE / 2;
      let gridY = row * GRID_SIZE + GRID_SIZE / 2;

      // In debug mode: log info and exit — never place a tower
      if (this.debugMode) {
        let rawTile  = this.mapGrid ? (this.mapGrid[row] ? this.mapGrid[row][col] : 'OOB') : 'no-grid';
        let hasTower = this.towers.some(t => t.x === gridX && t.y === gridY);
        let canBuild = this.canBuildAt(col, row);
        const DECODE = {
          [TILE_TYPES.GRASS]: 2, [TILE_TYPES.PATH]: 1,
          [TILE_TYPES.OBSTACLE]: 0, [TILE_TYPES.OCCUPIED]: 'occ'
        };
        let mapVal = (rawTile in DECODE) ? DECODE[rawTile] : rawTile;
        console.log(
          `Click at col=${col}, row=${row}, canBuild=${canBuild}, ` +
          `mapValue=${mapVal}, hasTower=${hasTower}`
        );
        return;
      }

      // ── Placement validity: one authoritative check ───────────────
      if (!this.canBuildAt(col, row)) {
        let tileType = this.mapGrid && this.mapGrid[row] ? this.mapGrid[row][col] : null;
        let reason =
          tileType === TILE_TYPES.PATH     ? "Can't build on the path!" :
          tileType === TILE_TYPES.OCCUPIED ? "Already occupied!"        :
                                             "Can't build here!";
        console.log(`❌ ${reason} (col=${col}, row=${row}, tile=${tileType})`);
        this.ui.showPlacementError(reason);
        return;
      }

      this.tryPlaceTower(this.selectedTowerType, gridX, gridY);
      return;
    }

    // ===== 胜利/失败状态：点击结算按钮 =====
    if (this.state === GameState.WIN || this.state === GameState.LOSE) {
      this.ui.handleEndScreenClick(mx, my);
      return;
    }
  }

  tryPlaceTower(towerType, x, y) {
    let config = TOWER_TYPES[towerType];
    if (!config) {
      console.log(`Unknown tower type: ${towerType}`);
      return false;
    }
    let cost = config.cost;

    if (!this.economy.canAfford(cost)) {
      console.log(`Not enough gold! Need ${cost}, have ${this.economy.getGold()}`);
      return false;
    }

    this.economy.spendGold(cost);

    let tower = new Tower(x, y, towerType);
    this.towers.push(tower);

    // Mark the grid cell as occupied so future placements and hover previews
    // correctly show this cell as unavailable.
    if (this.mapGrid) {
      occupyTile(this.mapGrid, x, y);
    }

    console.log(`Placed ${towerType} tower at (${x}, ${y})`);
    return true;
  }

  setSelectedTowerType(towerType) {
    if (!TOWER_TYPES[towerType]) return;
    this.selectedTowerType = towerType;
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

  returnToMenu() {
    this.towers = [];
    this.enemies = [];
    this.path = null;
    this.mapGrid = null;
    this.waveManager = null;
    this.economy = null;
    this.landmark = null;
    this.totalKills = 0;
    this.waveSurvived = 0;
    this.finalStats = null;
    this.selectedTowerType = 'basic';
    this.setState(GameState.MENU);
  }

  nextLevel() {
    if (this.currentLevel < TOTAL_LEVELS) {
      this.startLevel(this.currentLevel + 1);
    } else {
      console.log("All levels complete!");
      this.returnToMenu();
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
