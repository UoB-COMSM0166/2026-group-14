// GameManager - Core game loop and state coordinator

class GameManager {
  constructor() {
    this.state = GameState.MENU;
    this.currentLevel = 1;

    this.economy = null;
    this.landmark = null;
    this.towers = [];
    this.enemies = [];
    this.path = null;
    this.mapGrid = null;
    this.ui = new UIHUD(this);
    this.waveManager = null;

    this.totalKills = 0;
    this.waveSurvived = 0;
    this.finalStats = null;
    this.selectedTowerType = 'basic';

    // Prevents click-through when an HTML button callback changes state in the
    // same event that also triggers the canvas mousePressed handler.
    this.stateJustChanged = false;

    this.debugMode = false;
    this.currentMapImage = null;

    this.mapEditMode = false;
    this.editGrid = null;
    this.isDragging = false;
    this.dragValue = 0;

    this.pathEditMode = false;
    this.pathPoints = [];

    this.editModePaused = false;
    this.manualPaused = false;

    // Tutorial system
    this.tutorialMode = false;
    this.tutorialStep = 0;
    this.tutorialComplete = false;

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
        totalWaves: 6
      },
      3: {
        name: "Level 3 — Tower of London Siege",
        landmarkName: "Tower of London",
        landmarkHp: LANDMARK_MAX_HP + 10,
        landmarkX: CANVAS_WIDTH - 100,
        landmarkY: CANVAS_HEIGHT / 2,
        initialGold: 500,
        totalWaves: 6
      }
    };
    this.sound = new SoundManager();

    this.sound.load("place", "soundtrack/place.mp3");
    this.sound.load("death", "soundtrack/explode.mp3");
    this.sound.load("click", "soundtrack/ui_click.mp3");
    this.sound.load("click1", "soundtrack/ui_click2.mp3");
    this.sound.load("win", "soundtrack/game_win.mp3");
    this.sound.load("lose", "soundtrack/game_over.mp3");
    this.sound.load("bonus", "soundtrack/coins.mp3");
    this.sound.load("begin", "soundtrack/begin.mp3");
    this.sound.load("destruction", "soundtrack/destruction.mp3");
    console.log("[Game] GameManager initialised");
  }

  // --- State ---

  getState() {
    return this.state;
  }

  setState(newState) {
    console.log(`[Game] State: ${this.state} -> ${newState}`);
    this.state = newState;
    this.stateJustChanged = true;
  }

  // --- Level management ---

  startLevel(levelId) {
    applyLevelGridConfig(levelId);

    let config = this.levelConfigs[levelId];
    if (!config) {
      console.log(`[Game] Level ${levelId} does not exist`);
      return;
    }
    this.sound.play("begin");
    console.log(`[Game] Starting: ${config.name}`);

    this.currentLevel = levelId;
    this.economy = new Economy(config.initialGold);
    this.landmark = new Landmark(
      config.landmarkName,
      config.landmarkHp,
      config.landmarkX,
      config.landmarkY,
      this.sound
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
      1: getLevel1MapData,
      2: getLevel2MapData,
      3: getLevel3MapData
    };
    let mapDataFn = mapDataFns[levelId] || getLevel1MapData;
    this.mapGrid = mapDataFn();
    console.log(`[Game] Map grid built: ${this.mapGrid[0].length} cols x ${this.mapGrid.length} rows`);

    const mapImgMap = { 1: gameImages.mapLevel1, 2: gameImages.mapLevel2, 3: gameImages.mapLevel3 };
    this.currentMapImage = mapImgMap[levelId] || gameImages.mapLevel1;

    // Build the wave manager for this level (defined in Wave.js)
    const waveFns = {
      1: getLevel1Waves,
      2: getLevel2Waves,
      3: getLevel3Waves
    };
    let waveFn = waveFns[levelId] || getLevel1Waves;
    this.waveManager = new WaveManager(waveFn(), this.sound);
    this.totalKills = 0;
    this.waveSurvived = 0;
    this.finalStats = null;
    this.selectedTowerType = 'basic';
    this.availableTowers = LEVEL_AVAILABLE_TOWERS[levelId] || LEVEL_AVAILABLE_TOWERS[1];
    console.log(`[Game] Level ${levelId} available towers:`, this.availableTowers);

    this.mapEditMode = false;
    this.editGrid = null;
    this.pathEditMode = false;
    this.pathPoints = [];
    this.editModePaused = false;
    this.manualPaused = false;

    this.setState(GameState.PLAYING);
  }

  toggleMapEditMode() {
    this.mapEditMode = !this.mapEditMode;
    console.log('[Editor] mapEditMode:', this.mapEditMode);

    if (this.mapEditMode) {
      this.editModePaused = true;
      if (this.pathEditMode) this.togglePathEditMode();
      this.editGrid = Array.from({ length: ROWS }, () => new Array(COLS).fill(2));
      this.exportButton = null;
      console.log('[Editor] Map edit mode enabled (game paused)');
      console.log('[Editor] Edit grid created, size:', COLS, 'x', ROWS);
      console.log('[Editor] Press E to export code, or click Export button');
      console.log('[Editor] Press M to exit edit mode');
    } else {
      this.editModePaused = this.pathEditMode;
      this.editGrid = null;
      this.exportButton = null;
      this.isDragging = false;
      console.log('[Editor] Map edit mode disabled (game resumed)');
    }
  }

  exportGridCode() {
    if (!this.editGrid) {
      console.log('[Editor] No edit data to export');
      return;
    }

    let buildableCoords = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (this.editGrid[row][col] === 2) {
          buildableCoords.push([col, row]);
        }
      }
    }

    let levelNum = this.currentLevel || 1;
    console.log('========== EXPORTED CODE ==========');
    console.log('');
    console.log(`// Level ${levelNum} buildable grid whitelist`);
    console.log(`// ${buildableCoords.length} buildable cells`);
    console.log(`const LEVEL_${levelNum}_GRID_WHITELIST = [`);

    let currentCol = -1;
    for (let [col, row] of buildableCoords) {
      if (col !== currentCol) {
        console.log(`  // col ${col}`);
        currentCol = col;
      }
      console.log(`  [${col},${row}],`);
    }

    console.log('];');
    console.log('');
    console.log('Copy the code above to MapData.js');

    let fullCode = `const LEVEL_${levelNum}_GRID = (() => {
  const g = Array.from({ length: 15 }, () => new Array(32).fill(0));
  const whitelist = [
${buildableCoords.map(([c, r]) => `    [${c},${r}]`).join(',\n')}
  ];
  for (const [col, row] of whitelist) {
    if (row >= 0 && row < 15 && col >= 0 && col < 32) g[row][col] = 2;
  }
  return g;
})();`;
    console.log(`\n========== FULL LEVEL_${levelNum}_GRID REPLACEMENT CODE ==========`);
    console.log(fullCode);
  }

  togglePathEditMode() {
    this.pathEditMode = !this.pathEditMode;

    if (this.pathEditMode) {
      this.editModePaused = true;
      this.pathPoints = [];
      if (this.mapEditMode) this.toggleMapEditMode();
      console.log('[Editor] Path edit mode enabled (game paused)');
      console.log('[Editor] Click cells to add waypoints in order');
      console.log('[Editor] Press Z: undo last point; E: export path; N: exit');
    } else {
      this.editModePaused = this.mapEditMode;
      console.log('[Editor] Path edit mode disabled (game resumed)');
    }
  }

  exportPathCode() {
    if (this.pathPoints.length < 2) {
      console.log('[Editor] Too few waypoints, need at least 2');
      return;
    }

    let levelNum = this.currentLevel || 1;
    console.log('========== EXPORTED PATH CODE ==========');
    console.log('');
    console.log(`function getLevel${levelNum}Waypoints() {`);
    console.log('  // Based on CURRENT_GRID_SIZE cell centres (export uses live offset/size)');
    console.log('  return [');

    for (let i = 0; i < this.pathPoints.length; i++) {
      let pt = this.pathPoints[i];
      let x = colToCenterX(pt.col);
      let y = rowToCenterY(pt.row);
      let comment = '';
      if (i === 0) comment = '  // Entry';
      else if (i === this.pathPoints.length - 1) comment = '  // Exit';
      else comment = `  // Waypoint ${i}`;
      console.log(`    { x: ${x}, y: ${y} },${comment}`);
    }

    console.log('  ];');
    console.log('}');
    console.log('');
    console.log(`Copy the code above to replace getLevel${levelNum}Waypoints() in Path.js`);
  }

  // --- Per-frame update ---

  update() {
    // Reset click-through guard each frame so normal clicks work next frame
    this.stateJustChanged = false;

    if (this.state === GameState.IN_GAME_SETTINGS) return;

    if (this.state === GameState.MONSTER_INFO) return;

    if (this.state !== GameState.PLAYING) return;

    if (this.manualPaused) return;

    if (this.editModePaused) return;

    this.updateTowerBoosts();

    // Wave manager runs first so newly spawned enemies are available this frame
    if (this.waveManager) {
      this.waveManager.update(this.enemies, this.path);
      if (this.waveManager.consumeWaveClearEvent()) {
        this.sound.play("bonus");
        this.waveSurvived++;
        this.economy.addGold(WAVE_CLEAR_BONUS_GOLD);
        this.ui.showWaveBonus(`+${WAVE_CLEAR_BONUS_GOLD} Wave Bonus!`);
      }
    }

    for (let enemy of this.enemies) {
      enemy.update();
    }

    for (let enemy of this.enemies) {
      if (enemy.shouldHeal && enemy.ability === 'heal') {
        enemy.shouldHeal = false;
        for (let other of this.enemies) {
          if (other !== enemy) {
            let d = dist(enemy.x, enemy.y, other.x, other.y);
            if (d <= enemy.healRadius) {
              let healAmount = other.maxHp * enemy.healPercent;
              other.hp = Math.min(other.hp + healAmount, other.maxHp);
            }
          }
        }
        console.log('[Combat] Treant Mage healed nearby enemies');
      }
    }

    for (let enemy of this.enemies) {
      if (enemy.shouldSummon && enemy.ability === 'boss') {
        enemy.shouldSummon = false;
        for (let i = 0; i < 2; i++) {
          let summon = new Enemy(this.path, { type: 'basic', hp: 80, speed: 2.0 }, this.sound);
          summon.x = enemy.x;
          summon.y = enemy.y;
          summon.currentWaypointIndex = enemy.currentWaypointIndex;
          this.enemies.push(summon);
        }
        console.log('[Combat] Gentleman Bug summoned minions');
      }
    }

    for (let enemy of this.enemies) {
      if (enemy.shouldTaunt && enemy.ability === 'boss') {
        enemy.shouldTaunt = false;
        for (let tower of this.towers) {
          tower.tauntDebuff = 0.2;
          tower.tauntTimer = 300;
        }
        console.log('[Combat] Gentleman Bug released taunt wave');
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      let enemy = this.enemies[i];

      if (enemy.reachedEnd()) {
        this.landmark.takeDamage(ENEMY_REACH_DAMAGE);
        this.enemies.splice(i, 1);
        continue;
      }

      if (enemy.isDead()) {
        if (enemy.ability === 'explode') {
          for (let tower of this.towers) {
            let d = dist(enemy.x, enemy.y, tower.x, tower.y);
            if (d <= enemy.explodeRadius) {
              tower.disabled = true;
              tower.disableTimer = enemy.disableDuration;
              console.log('[Combat] Tower disabled by explosion');
            }
          }
        }
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

  updateTowerBoosts() {
    for (let tower of this.towers) {
      tower.isBoosted = false;
      tower.boostedDamageMultiplier = 1;
      tower.boostedFireRateMultiplier = 1;
    }

    let crystalTowers = this.towers.filter(t => t.type === 'crystal');

    for (let tower of this.towers) {
      if (tower.type === 'crystal') continue;

      let totalDamageBoost = 0;
      let totalFireRateBoost = 0;

      for (let crystal of crystalTowers) {
        let d = dist(tower.x, tower.y, crystal.x, crystal.y);
        if (d <= crystal.boostRadius) {
          totalDamageBoost += crystal.boostDamage;
          totalFireRateBoost += crystal.boostFireRate;
          tower.isBoosted = true;
        }
      }

      tower.boostedDamageMultiplier = 1 + Math.min(totalDamageBoost, 0.6);
      tower.boostedFireRateMultiplier = 1 + Math.min(totalFireRateBoost, 0.3);
    }
  }

  checkWinLose() {
    if (this.state !== GameState.PLAYING) return;

    if (this.landmark && this.landmark.isDestroyed()) {
      console.log("[Game] Landmark destroyed - GAME OVER");
      if (this.waveManager) this.waveManager.stop();
      this.recordFinalStats(GameState.LOSE);
      this.setState(GameState.LOSE);
      this.sound.play("lose");
      return;
    }
    // Win: all waves spawned, and no live enemies remain on the field
    if (this.landmark && this.landmark.hp > 0 && this.waveManager && this.waveManager.allWavesComplete) {
      let liveEnemies = this.enemies.filter(e => !e.isDead() && !e.reachedEnd());
      if (liveEnemies.length === 0) {
        console.log("[Game] All waves cleared - VICTORY");
        this.recordFinalStats(GameState.WIN);
        this.setState(GameState.WIN);
        this.sound.play("win");
      }
    }
  }

  recordFinalStats(resultState) {
    this.pathEditMode = false;
    this.editModePaused = false;
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
      case GameState.LEVEL_SELECT:
        this.ui.drawLevelSelect();
        break;
      case GameState.IN_GAME_SETTINGS:
        this.drawGameScene();
        this.ui.drawHUD();
        fill(0, 0, 0, 150);
        noStroke();
        rectMode(CORNER);
        rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.ui.drawInGameSettings();
        break;
      case GameState.PLAYING:
        this.drawGame();
        this.ui.drawHUD();
        if (this.manualPaused && !this.tutorialMode) {
          fill(0, 0, 0, 100);
          noStroke();
          rectMode(CORNER);
          rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          fill(255, 255, 255, 230);
          textAlign(CENTER, CENTER);
          textSize(48);
          textStyle(BOLD);
          text("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
          textStyle(NORMAL);
          textSize(20);
          fill(200, 200, 200);
          text("Click the Resume button or press SPACE to continue", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        }
        if (this.tutorialMode) {
          this.ui.drawTutorialOverlay();
        }
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
      case GameState.MONSTER_INFO:
        this.drawGameScene();
        this.ui.drawHUD();
        fill(0, 0, 0, 180);
        noStroke();
        rectMode(CORNER);
        rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.ui.drawMonsterInfoPanel(this.currentLevel);
        break;
    }
    this.ui.renderBrightnessOverlay();
  }

  drawGameScene() {
    this.drawBackground();
    if (this.debugMode && this.path) this.path.draw();
    for (let tower of this.towers) tower.draw();
    for (let enemy of this.enemies) enemy.draw();
    if (this.landmark) this.landmark.draw();
  }



  drawBackground() {
    let bg = this.currentMapImage || gameImages.mapLevel1;
    if (!bg) return;

    let imgW = bg.width;   // 2976
    let imgH = bg.height;  // 1436
    let designRatio = DESIGN_WIDTH / DESIGN_HEIGHT;
    let imgRatio = imgW / imgH;

    let srcX, srcY, srcW, srcH;

    if (Math.abs(imgRatio - designRatio) < 0.01) {
      srcX = 0;
      srcY = 0;
      srcW = imgW;
      srcH = imgH;
    } else if (imgRatio > designRatio) {
      srcH = imgH;
      srcW = imgH * designRatio;
      srcX = (imgW - srcW) / 2;
      srcY = 0;
    } else {
      srcW = imgW;
      srcH = imgW / designRatio;
      srcX = 0;
      srcY = (imgH - srcH) / 2;
    }

    image(bg, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, srcX, srcY, srcW, srcH);
  }

  drawGame() {
    let bg = this.currentMapImage || gameImages.mapLevel1;
    if (bg && bg.width > 0) {
      imageMode(CORNER);
      this.drawBackground();
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

    if (this.state === GameState.PLAYING && !this.mapEditMode && !this.pathEditMode) {
      this.ui.drawTowerPlacementPreview();
    }

    // Debug grid overlay — drawn on top of everything except the HUD
    if (this.debugMode) {
      this.drawDebugGrid();
    }

    if (this.mapEditMode && this.editGrid) {
      this.drawEditGrid();
    }

    if (this.pathEditMode) {
      this.drawPathEditMode();
    }

    this.drawHUD();
  }

  drawEditGrid() {
    push();

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        let x = colToLeftX(col);
        let y = rowToTopY(row);

        if (this.editGrid[row][col] === 2) {
          fill(0, 255, 0, 100);
        } else {
          fill(255, 0, 0, 100);
        }
        noStroke();
        rect(x, y, CURRENT_GRID_SIZE, CURRENT_GRID_SIZE);

        stroke(255, 255, 255, 150);
        strokeWeight(1);
        noFill();
        rect(x, y, CURRENT_GRID_SIZE, CURRENT_GRID_SIZE);

        fill(255, 255, 255, 200);
        noStroke();
        textSize(9);
        textAlign(CENTER, CENTER);
        text(`${col},${row}`, x + CURRENT_GRID_SIZE / 2, y + CURRENT_GRID_SIZE / 2);
      }
    }

    let mx = getGameMouseX();
    let my = getGameMouseY();
    let hoverCol = pixelToCol(mx);
    let hoverRow = pixelToRow(my);

    if (hoverCol >= 0 && hoverCol < COLS && hoverRow >= 0 && hoverRow < ROWS) {
      stroke(255, 255, 0);
      strokeWeight(3);
      noFill();
      rect(colToLeftX(hoverCol), rowToTopY(hoverRow), CURRENT_GRID_SIZE, CURRENT_GRID_SIZE);
    }

    fill(0, 0, 0, 220);
    noStroke();
    rect(10, 10, 400, 80, 8);

    fill(255, 255, 0);
    textSize(16);
    textAlign(LEFT, TOP);
    text('Map Edit Mode', 20, 18);

    fill(255, 255, 255);
    textSize(12);
    text('Click cells: toggle Buildable (green) / Non-buildable (red)', 20, 42);
    text('Press E: export code  |  Press M: exit edit mode', 20, 60);
    text(`Current: col=${hoverCol}, row=${hoverRow}`, 20, 78);

    let btnX = DESIGN_WIDTH - 150;
    let btnY = 30;
    let btnW = 130;
    let btnH = 40;

    let hovered = mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH;
    fill(hovered ? 70 : 50, hovered ? 180 : 150, 50);
    stroke(255);
    strokeWeight(2);
    rectMode(CORNER);
    rect(btnX, btnY, btnW, btnH, 8);

    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text('Export Code (E)', btnX + btnW / 2, btnY + btnH / 2);

    this.exportButton = { x: btnX, y: btnY, width: btnW, height: btnH };

    pop();
  }

  drawPathEditMode() {
    push();

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        let x = colToLeftX(col);
        let y = rowToTopY(row);

        let canBuild = this.canBuildAt(col, row);

        if (!canBuild) {
          fill(255, 100, 100, 60);
        } else {
          fill(100, 255, 100, 30);
        }
        noStroke();
        rect(x, y, CURRENT_GRID_SIZE, CURRENT_GRID_SIZE);

        stroke(255, 255, 255, 80);
        strokeWeight(1);
        noFill();
        rect(x, y, CURRENT_GRID_SIZE, CURRENT_GRID_SIZE);

        fill(255, 255, 255, 150);
        noStroke();
        textSize(8);
        textAlign(CENTER, CENTER);
        text(`${col},${row}`, x + CURRENT_GRID_SIZE / 2, y + CURRENT_GRID_SIZE / 2);
      }
    }

    if (this.pathPoints.length > 0) {
      stroke(255, 200, 0);
      strokeWeight(4);
      noFill();
      beginShape();
      for (let pt of this.pathPoints) {
        let x = colToCenterX(pt.col);
        let y = rowToCenterY(pt.row);
        vertex(x, y);
      }
      endShape();

      for (let i = 0; i < this.pathPoints.length; i++) {
        let pt = this.pathPoints[i];
        let x = colToCenterX(pt.col);
        let y = rowToCenterY(pt.row);

        if (i === 0) {
          fill(50, 255, 50);
        } else if (i === this.pathPoints.length - 1) {
          fill(255, 50, 50);
        } else {
          fill(255, 200, 50);
        }
        stroke(255);
        strokeWeight(2);
        ellipse(x, y, 24, 24);

        fill(0);
        noStroke();
        textSize(12);
        textAlign(CENTER, CENTER);
        text(i + 1, x, y);
      }
    }

    let mx = getGameMouseX();
    let my = getGameMouseY();
    let hoverCol = pixelToCol(mx);
    let hoverRow = pixelToRow(my);

    if (hoverCol >= 0 && hoverCol < COLS && hoverRow >= 0 && hoverRow < ROWS) {
      stroke(255, 255, 0);
      strokeWeight(3);
      noFill();
      rect(colToLeftX(hoverCol), rowToTopY(hoverRow), CURRENT_GRID_SIZE, CURRENT_GRID_SIZE);
    }

    fill(0, 0, 0, 220);
    noStroke();
    rectMode(CORNER);
    rect(10, 10, 450, 120, 8);

    fill(255, 200, 0);
    textSize(18);
    textAlign(LEFT, TOP);
    text('Path Edit Mode', 20, 18);

    fill(100, 255, 100);
    textSize(14);
    text('Game paused - enemies not moving', 20, 42);

    fill(255, 255, 255);
    textSize(13);
    text('Click red cells (path) to add waypoints in order', 20, 65);
    text('Press Z: undo  |  E: export  |  N: exit', 20, 85);
    let coordText = (hoverCol >= 0 && hoverCol < COLS && hoverRow >= 0 && hoverRow < ROWS)
      ? `col=${hoverCol}, row=${hoverRow}` : '-';
    text(`Current: ${coordText}  |  Points: ${this.pathPoints.length}`, 20, 105);

    pop();
  }

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
    if (row < 0 || row >= this.mapGrid.length) return false;
    if (col < 0 || col >= this.mapGrid[0].length) return false;

    let cellCenterY = rowToCenterY(row);
    if (cellCenterY < HUD_HEIGHT) return false;

    // Tile must be exactly GRASS
    if (this.mapGrid[row][col] !== TILE_TYPES.GRASS) return false;

    // A tower already occupies this cell
    let cx = colToCenterX(col);
    let cy = rowToCenterY(row);
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
    if (!this.debugMode) return;

    push();
    rectMode(CORNER);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let x = GRID_OFFSET_X + c * CURRENT_GRID_SIZE;
        let y = GRID_OFFSET_Y + r * CURRENT_GRID_SIZE;

        let tile = this.mapGrid && this.mapGrid[r] ? this.mapGrid[r][c] : null;
        if (tile === TILE_TYPES.GRASS) {
          fill(0, 255, 0, 40);
        } else {
          fill(255, 0, 0, 20);
        }

        noStroke();
        rect(x, y, CURRENT_GRID_SIZE, CURRENT_GRID_SIZE);

        stroke(255, 255, 255, 60);
        strokeWeight(1);
        noFill();
        rect(x, y, CURRENT_GRID_SIZE, CURRENT_GRID_SIZE);

        if (r === 0) {
          fill(255, 255, 0, 200);
          noStroke();
          textSize(10);
          textAlign(CENTER, TOP);
          text(c, x + CURRENT_GRID_SIZE / 2, y + 2);
        }
        if (c === 0) {
          fill(255, 255, 0, 200);
          noStroke();
          textSize(10);
          textAlign(LEFT, CENTER);
          text(r, x + 2, y + CURRENT_GRID_SIZE / 2);
        }
      }
    }

    let mx = getGameMouseX();
    let my = getGameMouseY();
    stroke(255, 0, 255);
    strokeWeight(1);
    line(mx - 20, my, mx + 20, my);
    line(mx, my - 20, mx, my + 20);

    let mCol = pixelToCol(mx);
    let mRow = pixelToRow(my);
    let canBuild = this.mapGrid ? this.canBuildAt(mCol, mRow) : false;
    let rawTile = (this.mapGrid && mRow >= 0 && mRow < ROWS && mCol >= 0 && mCol < COLS)
      ? this.mapGrid[mRow][mCol]
      : 'OOB';
    const DECODE = {
      [TILE_TYPES.GRASS]: 2, [TILE_TYPES.PATH]: 1,
      [TILE_TYPES.OBSTACLE]: 0, [TILE_TYPES.OCCUPIED]: 'occ'
    };
    let mapVal = (rawTile in DECODE) ? DECODE[rawTile] : rawTile;
    let hoverLine = `Grid: col=${mCol}, row=${mRow} | canBuild: ${canBuild} | mapValue: ${mapVal}`;

    noStroke();
    textSize(13);
    textAlign(LEFT, CENTER);
    fill(0, 0, 0, 180);
    rect(8, 54, 440, 22, 4);
    fill(canBuild ? color(80, 255, 120) : color(255, 110, 80));
    text(hoverLine, 16, 65);

    fill(0, 0, 0, 200);
    noStroke();
    rectMode(CORNER);
    rect(5, 80, 280, 180, 5);

    fill(255, 255, 0);
    textSize(13);
    textAlign(LEFT, TOP);
    let y = 88;
    text('Level: ' + this.currentLevel, 12, y); y += 20;
    text('GRID_OFFSET_X: ' + GRID_OFFSET_X, 12, y); y += 20;
    text('GRID_OFFSET_Y: ' + GRID_OFFSET_Y, 12, y); y += 20;
    text('GRID_SIZE: ' + CURRENT_GRID_SIZE, 12, y); y += 25;

    fill(200, 200, 200);
    textSize(11);
    text('Controls:', 12, y); y += 15;
    text('Arrow Keys = Adjust offset', 12, y); y += 15;
    text('- / = = Adjust grid size', 12, y); y += 15;
    text('P = Print config to console', 12, y);

    pop();
  }

  startTutorial() {
    this.tutorialMode = true;
    this.tutorialStep = 0;
    this.tutorialComplete = false;
    this.manualPaused = true;
    console.log('[Tutorial] Started');
  }

  nextTutorialStep() {
    this.tutorialStep++;
    if (this.tutorialStep >= TUTORIAL_STEPS.length) {
      this.endTutorial();
    } else {
      console.log('[Tutorial] Step:', TUTORIAL_STEPS[this.tutorialStep].id);
    }
  }

  endTutorial() {
    this.tutorialMode = false;
    this.tutorialComplete = true;
    this.manualPaused = false;
    console.log('[Tutorial] Completed');
  }

  skipTutorial() {
    this.tutorialMode = false;
    this.tutorialComplete = true;
    this.manualPaused = false;
    console.log('[Tutorial] Skipped');
  }

  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    console.log(`[Debug] Debug mode ${this.debugMode ? 'ON' : 'OFF'}`);
    if (this.debugMode && !this.mapGrid) {
      console.warn('mapGrid is null — start a level first to see tile data.');
    }
  }

  drawHUD() {
  }

  // --- Player actions ---

  handleClick(mx, my) {
    // Guard against click-through: if state just changed this same event
    // (e.g. an HTML button callback already fired startLevel/setState),
    // drop this canvas-level click entirely.
    if (this.stateJustChanged) return;

    if (this.pathEditMode) {
      let col = pixelToCol(mx);
      let row = pixelToRow(my);

      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        this.pathPoints.push({ col: col, row: row });

        let pixelX = colToCenterX(col);
        let pixelY = rowToCenterY(row);

        console.log(`[Editor] Add waypoint #${this.pathPoints.length}: col=${col}, row=${row} -> (${pixelX}, ${pixelY})`);
      }
      return;
    }

    if (this.mapEditMode && this.editGrid) {
      if (this.exportButton) {
        let btn = this.exportButton;
        if (mx >= btn.x && mx <= btn.x + btn.width &&
          my >= btn.y && my <= btn.y + btn.height) {
          console.log('[Editor] Export button clicked');
          this.exportGridCode();
          return;
        }
      }

      let col = pixelToCol(mx);
      let row = pixelToRow(my);

      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        if (this.editGrid[row][col] === 2) {
          this.editGrid[row][col] = 0;
          this.isDragging = true;
          this.dragValue = 0;
          console.log(`[Editor] [${col},${row}] -> Non-buildable`);
        } else {
          this.editGrid[row][col] = 2;
          this.isDragging = true;
          this.dragValue = 2;
          console.log(`[Editor] [${col},${row}] -> Buildable`);
        }
      }
      return;
    }

    if (this.state === GameState.IN_GAME_SETTINGS) {
      let result = this.ui.handleSettingsClick(mx, my);
      if (result === 'close' || result === 'back') {
        this.setState(GameState.PLAYING);
      }
      return;
    }

    if (this.state === GameState.SETTINGS) {
      let result = this.ui.handleSettingsClick(mx, my);
      if (result === 'close' || result === 'back') {
        this.setState(GameState.MENU);
      }
      return;
    }

    if (this.state === GameState.MENU) {
      this.ui.handleMenuClick(mx, my);
      return;
    }

    if (this.state === GameState.LEVEL_SELECT) {
      // Debug: log click position
      if (this.ui.levelSelectDebug) {
        console.log('[Debug] Clicked at: x=' + mx + ', y=' + my);
        console.log('[Debug] Button code: { x: ' + mx + ', y: ' + my + ', w: 150, h: 50 }');
      }

      // Game Instructions button — starts Level 1 with tutorial
      let instrBtnX = 636;
      let instrBtnY = 827;
      let instrBtnW = 328;
      let instrBtnH = 55;

      if (mx >= instrBtnX && mx <= instrBtnX + instrBtnW &&
        my >= instrBtnY && my <= instrBtnY + instrBtnH) {
        this.sound.play("click1");
        this.startLevel(1);
        this.startTutorial();
        return;
      }

      let backBtn = this.ui.backButton;
      if (backBtn &&
        mx > backBtn.x - backBtn.width / 2 && mx < backBtn.x + backBtn.width / 2 &&
        my > backBtn.y - backBtn.height / 2 && my < backBtn.y + backBtn.height / 2) {
        this.sound.play("click1");
        this.setState(GameState.MENU);
        return;
      }

      let levelBtns = this.ui.levelButtons;
      if (levelBtns) {
        for (let btn of levelBtns) {
          let left = btn.x - btn.width / 2;
          let right = btn.x + btn.width / 2;
          let top = btn.y - btn.height / 2;
          let bottom = btn.y + btn.height / 2;

          if (mx >= left && mx <= right && my >= top && my <= bottom) {
            if (btn.unlocked) {
              console.log(`[Game] Starting Level ${btn.level}: ${btn.name}`);
              this.sound.play("click1");
              this.startLevel(btn.level);
              return;
            } else {
              console.log(`[Game] Level ${btn.level} is locked`);
              return;
            }
          }
        }
      }
      return;
    }

    if (this.state === GameState.PLAYING && this.tutorialMode && this.ui.tutorialDebugMode) {
      let clickData = { x: Math.round(mx), y: Math.round(my) };
      this.ui.tutorialDebugClicks.push(clickData);

      console.log('[Tutorial Debug] Click #' + this.ui.tutorialDebugClicks.length + ':',
        'x=' + clickData.x + ', y=' + clickData.y);

      if (this.ui.tutorialDebugClicks.length === 2) {
        let c1 = this.ui.tutorialDebugClicks[0];
        let c2 = this.ui.tutorialDebugClicks[1];

        let x = Math.min(c1.x, c2.x);
        let y = Math.min(c1.y, c2.y);
        let w = Math.abs(c2.x - c1.x);
        let h = Math.abs(c2.y - c1.y);

        console.log('='.repeat(50));
        console.log('[Tutorial Debug] HIGHLIGHT AREA for step "' +
          TUTORIAL_STEPS[this.tutorialStep].id + '":');
        console.log('{ x: ' + x + ', y: ' + y + ', w: ' + w + ', h: ' + h + ' }');
        console.log('='.repeat(50));

        this.ui.tutorialDebugClicks = [];
      }
      return;
    }

    if (this.state === GameState.PLAYING && this.tutorialMode) {
      if (this.ui.tutorialNextBtn) {
        let btn = this.ui.tutorialNextBtn;
        if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
          this.sound.play("click1");
          this.nextTutorialStep();
          return;
        }
      }
      if (this.ui.tutorialSkipBtn) {
        let btn = this.ui.tutorialSkipBtn;
        if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
          this.sound.play("click1");
          this.skipTutorial();
          return;
        }
      }
      return;
    }

    if (this.state === GameState.PLAYING) {
      if (this.ui.inGameSettingsBtn) {
        let btn = this.ui.inGameSettingsBtn;
        if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
          this.setState(GameState.IN_GAME_SETTINGS);
          return;
        }
      }

      if (this.ui.pauseBtn) {
        let btn = this.ui.pauseBtn;
        if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
          this.sound.play("click1");
          this.manualPaused = !this.manualPaused;
          console.log(this.manualPaused ? '[Game] Game paused' : '[Game] Game resumed');
          return;
        }
      }

      if (this.ui.monsterInfoBtn) {
        let btn = this.ui.monsterInfoBtn;
        if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
          this.sound.play("click1");
          this.setState(GameState.MONSTER_INFO);
          return;
        }
      }

      if (this.manualPaused) return;

      if (this.ui.handleTowerPanelClick(mx, my)) return;
      if (my < HUD_HEIGHT) return;  // top HUD bar

      let col = pixelToCol(mx);
      let row = pixelToRow(my);
      let gridX = colToCenterX(col);
      let gridY = rowToCenterY(row);

      // In debug mode: log info and exit — never place a tower
      if (this.debugMode) {
        let rawTile = this.mapGrid ? (this.mapGrid[row] ? this.mapGrid[row][col] : 'OOB') : 'no-grid';
        let hasTower = this.towers.some(t => t.x === gridX && t.y === gridY);
        let canBuild = this.canBuildAt(col, row);
        const DECODE = {
          [TILE_TYPES.GRASS]: 2, [TILE_TYPES.PATH]: 1,
          [TILE_TYPES.OBSTACLE]: 0, [TILE_TYPES.OCCUPIED]: 'occ'
        };
        let mapVal = (rawTile in DECODE) ? DECODE[rawTile] : rawTile;
        console.log(
          `[Debug] Click at col=${col}, row=${row}, canBuild=${canBuild}, ` +
          `mapValue=${mapVal}, hasTower=${hasTower}`
        );
        return;
      }

      if (!this.canBuildAt(col, row)) {
        let tileType = this.mapGrid && this.mapGrid[row] ? this.mapGrid[row][col] : null;
        let reason =
          tileType === TILE_TYPES.PATH ? "Can't build on the path!" :
            tileType === TILE_TYPES.OCCUPIED ? "Already occupied!" :
              "Can't build here!";
        console.log(`[Game] ${reason} (col=${col}, row=${row}, tile=${tileType})`);
        this.ui.showPlacementError(reason);
        return;
      }

      this.tryPlaceTower(this.selectedTowerType, gridX, gridY);
      return;
    }

    if (this.state === GameState.MONSTER_INFO) {
      if (this.ui.monsterInfoCloseBtn) {
        let btn = this.ui.monsterInfoCloseBtn;
        if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
          this.sound.play("click1");
          this.setState(GameState.PLAYING);
          return;
        }
      }
      return;
    }

    if (this.state === GameState.WIN || this.state === GameState.LOSE) {
      this.ui.handleEndScreenClick(mx, my);
      return;
    }
  }

  handleMouseDrag(mx, my) {
    if (this.mapEditMode && this.isDragging && this.editGrid) {
      let col = pixelToCol(mx);
      let row = pixelToRow(my);

      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        this.editGrid[row][col] = this.dragValue;
      }
    }
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  tryPlaceTower(towerType, x, y) {
    let config = TOWER_TYPES[towerType];
    if (!config) {
      console.log(`[Game] Unknown tower type: ${towerType}`);
      return false;
    }
    let cost = config.cost;

    if (!this.economy.canAfford(cost)) {
      console.log(`[Game] Not enough gold: need ${cost}, have ${this.economy.getGold()}`);
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

    console.log(`[Game] Placed ${towerType} tower at (${x}, ${y})`);
    this.sound.play("place")
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
      console.log("[Game] All levels complete!");
      this.returnToMenu();
    }
  }

  drawMenu() {
    background(20, 60, 20);

    fill(255, 215, 0);
    textAlign(CENTER, CENTER);
    textSize(72);
    text("DEFEND BRITAIN", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    textSize(48);
    text("UK", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 - 80);

    fill(200, 200, 200);
    textSize(24);
    text("Protect the British Landmarks!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 60);

    let btnX = CANVAS_WIDTH / 2;
    let btnY = CANVAS_HEIGHT / 2 + 40;
    let btnW = 280;
    let btnH = 60;

    let hovering = getGameMouseX() > btnX - btnW / 2 && getGameMouseX() < btnX + btnW / 2 &&
      getGameMouseY() > btnY - btnH / 2 && getGameMouseY() < btnY + btnH / 2;

    if (hovering) {
      fill(50, 150, 50);
      cursor(HAND);
    } else {
      fill(34, 100, 34);
      cursor(ARROW);
    }
    stroke(255, 215, 0);
    strokeWeight(3);
    rectMode(CENTER);
    rect(btnX, btnY, btnW, btnH, 10);

    noStroke();
    fill(255);
    textSize(28);
    text("▶  START GAME", btnX, btnY);

    fill(120);
    textSize(16);
    text("Press 1, 2, 3 to select level", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);

    fill(80);
    textSize(14);
    text("2026 Group 14 — University of Bristol", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);

    rectMode(CORNER);
  }

  drawWin() {
    fill(0, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    fill(255, 215, 0);
    textAlign(CENTER, CENTER);
    textSize(80);
    text("VICTORY!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    textSize(48);
    text("***", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 70);

    fill(255);
    textSize(24);
    let gold = this.economy ? this.economy.getGold() : 0;
    text("Remaining Gold: " + gold, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    text("Landmark HP: " + this.landmark.hp + "/" + this.landmark.maxHp,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65);

    fill(200);
    textSize(20);
    text("Press N → Next Level    Press R → Replay", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
  }

  drawLose() {
    fill(100, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    fill(255, 50, 50);
    textAlign(CENTER, CENTER);
    textSize(80);
    text("DEFEATED!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    textSize(32);
    fill(255, 150, 150);
    let landmarkName = this.landmark ? this.landmark.name : "Landmark";
    text(landmarkName + " has fallen...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 70);

    fill(200);
    textSize(20);
    text("Press R → Retry", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
  }

  drawPaused() {
    fill(0, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(64);
    text("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    fill(200);
    textSize(20);
    text("Press P → Resume    Press R → Restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  }


}
