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
    this.currentMapImage = null;  // 当前关卡地图背景，由 startLevel 设置

    // 地图编辑模式（按 M 键切换）
    this.mapEditMode = false;
    this.editGrid = null;  // 编辑中的网格数据副本
    this.isDragging = false;
    this.dragValue = 0;  // 拖拽时要设置的值

    // 路径编辑模式（按 N 键切换）
    this.pathEditMode = false;
    this.pathPoints = [];  // 存储路径点 [{col, row}, ...]

    this.editModePaused = false;  // 地图/路径编辑模式下自动暂停游戏

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
        initialGold: 500,  // 第三关更难，给更多初始金币
        totalWaves: 6
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
      1: getLevel1MapData,
      2: getLevel2MapData,
      3: getLevel3MapData
    };
    let mapDataFn = mapDataFns[levelId] || getLevel1MapData;
    this.mapGrid = mapDataFn();
    console.log(`Map grid built: ${this.mapGrid[0].length} cols × ${this.mapGrid.length} rows`);

    // 设置当前关卡地图背景
    const mapImgMap = { 1: gameImages.mapLevel1, 2: gameImages.mapLevel2, 3: gameImages.mapLevel3 };
    this.currentMapImage = mapImgMap[levelId] || gameImages.mapLevel1;

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

    this.mapEditMode = false;  // 切换关卡时退出编辑模式
    this.editGrid = null;
    this.pathEditMode = false;
    this.pathPoints = [];
    this.editModePaused = false;

    this.setState(GameState.PLAYING);
  }

  toggleMapEditMode() {
    this.mapEditMode = !this.mapEditMode;
    console.log('mapEditMode 现在是:', this.mapEditMode);

    if (this.mapEditMode) {
      this.editModePaused = true;
      if (this.pathEditMode) this.togglePathEditMode();  // 互斥：退出路径编辑
      // 进入编辑模式时，创建网格副本，初始化为全部可建造(2)
      this.editGrid = Array.from({ length: ROWS }, () => new Array(COLS).fill(2));
      this.exportButton = null;  // 会在 drawEditGrid 中设置
      console.log('🎨 地图编辑模式开启（游戏已暂停）');
      console.log('✅ 编辑网格已创建，尺寸:', COLS, 'x', ROWS);
      console.log('📌 按 E 键导出代码，或点击右上角「导出代码」按钮');
      console.log('📌 按 M 键退出编辑模式');
    } else {
      this.editModePaused = this.pathEditMode;  // 若路径编辑仍开启则保持暂停
      this.editGrid = null;
      this.exportButton = null;
      this.isDragging = false;
      console.log('🎨 地图编辑模式关闭（游戏已恢复）');
    }
  }

  exportGridCode() {
    if (!this.editGrid) {
      console.log('❌ 没有编辑数据可导出');
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
    console.log('==========================================');
    console.log('========== 📋 导出的代码 ==========');
    console.log('==========================================');
    console.log('');
    console.log(`// Level ${levelNum} 可建造格子白名单`);
    console.log(`// 共 ${buildableCoords.length} 个可建造格子`);
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
    console.log('==========================================');
    console.log('👆 请复制上面的代码到 MapData.js');
    console.log('==========================================');

    // 完整 LEVEL_N_GRID 替换代码（可直接粘贴到 MapData.js）
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
    console.log(`\n========== 完整 LEVEL_${levelNum}_GRID 替换代码 ==========`);
    console.log(fullCode);
    console.log('================================================');
  }

  togglePathEditMode() {
    this.pathEditMode = !this.pathEditMode;

    if (this.pathEditMode) {
      this.editModePaused = true;
      this.pathPoints = [];
      if (this.mapEditMode) this.toggleMapEditMode();  // 互斥：退出地图编辑
      console.log('🛤️ 路径编辑模式开启（游戏已暂停）');
      console.log('   点击格子添加路径点（按顺序点击）');
      console.log('   按 Z 键：撤销上一个点');
      console.log('   按 E 键：导出路径代码');
      console.log('   按 N 键：退出路径编辑模式');
    } else {
      this.editModePaused = this.mapEditMode;  // 若地图编辑仍开启则保持暂停
      console.log('🛤️ 路径编辑模式关闭（游戏已恢复）');
    }
  }

  exportPathCode() {
    if (this.pathPoints.length < 2) {
      console.log('❌ 路径点太少，至少需要 2 个点');
      return;
    }

    let levelNum = this.currentLevel || 1;
    console.log('==========================================');
    console.log('========== 📋 导出的路径代码 ==========');
    console.log('==========================================');
    console.log('');
    console.log(`function getLevel${levelNum}Waypoints() {`);
    console.log('  // 基于 GRID_SIZE=60 的格子中心坐标');
    console.log('  return [');

    for (let i = 0; i < this.pathPoints.length; i++) {
      let pt = this.pathPoints[i];
      let x = pt.col * GRID_SIZE + GRID_SIZE / 2;
      let y = pt.row * GRID_SIZE + GRID_SIZE / 2;
      let comment = '';
      if (i === 0) comment = '  // 入口';
      else if (i === this.pathPoints.length - 1) comment = '  // 终点';
      else comment = `  // 路径点 ${i}`;
      console.log(`    { x: ${x}, y: ${y} },${comment}`);
    }

    console.log('  ];');
    console.log('}');
    console.log('');
    console.log('==========================================');
    console.log(`👆 请复制上面的代码替换 Path.js 中的 getLevel${levelNum}Waypoints()`);
    console.log('==========================================');
  }

  // --- Per-frame update ---

  update() {
    // Reset click-through guard each frame so normal clicks work next frame
    this.stateJustChanged = false;

    if (this.state !== GameState.PLAYING) return;

    // 编辑模式（地图/路径）下跳过游戏更新，防止怪物移动导致游戏结束
    if (this.editModePaused) return;

    this.updateTowerBoosts();

    // Wave manager runs first so newly spawned enemies are available this frame
    if (this.waveManager) {
      this.waveManager.update(this.enemies, this.path);
      if (this.waveManager.consumeWaveClearEvent()) {
        this.waveSurvived++;
        this.economy.addGold(WAVE_CLEAR_BONUS_GOLD);
        this.ui.showWaveBonus(`+${WAVE_CLEAR_BONUS_GOLD} Wave Bonus!`);
      }
    }

    for (let enemy of this.enemies) {
      enemy.update();
    }

    // 处理树人法师治疗
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
        console.log('💚 Treant Mage 治疗了周围的怪物！');
      }
    }

    // 处理 Boss 召唤
    for (let enemy of this.enemies) {
      if (enemy.shouldSummon && enemy.ability === 'boss') {
        enemy.shouldSummon = false;
        for (let i = 0; i < 2; i++) {
          let summon = new Enemy(this.path, { type: 'basic', hp: 80, speed: 2.0 });
          summon.x = enemy.x;
          summon.y = enemy.y;
          summon.currentWaypointIndex = enemy.currentWaypointIndex;
          this.enemies.push(summon);
        }
        console.log('🎩 Gentleman Bug 召唤了仆从！');
      }
    }

    // 处理 Boss 嘲讽
    for (let enemy of this.enemies) {
      if (enemy.shouldTaunt && enemy.ability === 'boss') {
        enemy.shouldTaunt = false;
        for (let tower of this.towers) {
          tower.tauntDebuff = 0.2;
          tower.tauntTimer = 300;
        }
        console.log('🎩 Gentleman Bug 释放了嘲讽波！');
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
        // 处理哥布林爆破手死亡爆炸
        if (enemy.ability === 'explode') {
          for (let tower of this.towers) {
            let d = dist(enemy.x, enemy.y, tower.x, tower.y);
            if (d <= enemy.explodeRadius) {
              tower.disabled = true;
              tower.disableTimer = enemy.disableDuration;
              console.log('💥 塔被爆炸禁用了！');
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
    this.pathEditMode = false;  // 结算时退出路径编辑
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



  /**
   * 绘制背景图，裁剪以匹配设计尺寸宽高比，不变形
   * 使用 currentMapImage（由 startLevel 根据关卡设置）
   */
  drawBackground() {
    let bg = this.currentMapImage || gameImages.mapLevel1;
    if (!bg) return;

    let imgW = bg.width;   // 2976
    let imgH = bg.height;  // 1436
    let designRatio = DESIGN_WIDTH / DESIGN_HEIGHT;
    let imgRatio = imgW / imgH;

    let srcX, srcY, srcW, srcH;

    if (Math.abs(imgRatio - designRatio) < 0.01) {
      // 宽高比已匹配，直接使用整张图
      srcX = 0;
      srcY = 0;
      srcW = imgW;
      srcH = imgH;
    } else if (imgRatio > designRatio) {
      // 背景图更宽，裁剪左右两边
      srcH = imgH;
      srcW = imgH * designRatio;
      srcX = (imgW - srcW) / 2;
      srcY = 0;
    } else {
      // 背景图更高，裁剪上下两边
      srcW = imgW;
      srcH = imgW / designRatio;
      srcX = 0;
      srcY = (imgH - srcH) / 2;
    }

    image(bg, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, srcX, srcY, srcW, srcH);
  }

  drawGame() {
    // Map background — 使用当前关卡地图，裁剪绘制保持设计尺寸宽高比
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

    // 地图编辑模式网格
    if (this.mapEditMode && this.editGrid) {
      this.drawEditGrid();
    }

    // 路径编辑模式
    if (this.pathEditMode) {
      this.drawPathEditMode();
    }

    this.drawHUD();
  }

  drawEditGrid() {
    push();

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        let x = col * GRID_SIZE;
        let y = row * GRID_SIZE;

        if (this.editGrid[row][col] === 2) {
          fill(0, 255, 0, 100);
        } else {
          fill(255, 0, 0, 100);
        }
        noStroke();
        rect(x, y, GRID_SIZE, GRID_SIZE);

        stroke(255, 255, 255, 150);
        strokeWeight(1);
        noFill();
        rect(x, y, GRID_SIZE, GRID_SIZE);

        fill(255, 255, 255, 200);
        noStroke();
        textSize(9);
        textAlign(CENTER, CENTER);
        text(`${col},${row}`, x + GRID_SIZE / 2, y + GRID_SIZE / 2);
      }
    }

    let mx = getGameMouseX();
    let my = getGameMouseY();
    let hoverCol = Math.floor(mx / GRID_SIZE);
    let hoverRow = Math.floor(my / GRID_SIZE);

    if (hoverCol >= 0 && hoverCol < COLS && hoverRow >= 0 && hoverRow < ROWS) {
      stroke(255, 255, 0);
      strokeWeight(3);
      noFill();
      rect(hoverCol * GRID_SIZE, hoverRow * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }

    fill(0, 0, 0, 220);
    noStroke();
    rect(10, 10, 400, 80, 8);

    fill(255, 255, 0);
    textSize(16);
    textAlign(LEFT, TOP);
    text('🎨 地图编辑模式', 20, 18);

    fill(255, 255, 255);
    textSize(12);
    text('点击格子：切换 可建造(绿) ↔ 不可建造(红)', 20, 42);
    text('按 E 键：导出坐标代码  |  按 M 键：退出编辑模式', 20, 60);
    text(`当前: col=${hoverCol}, row=${hoverRow}`, 20, 78);

    // 导出按钮（备用，键盘不响应时可点击）
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
    text('导出代码 (E)', btnX + btnW / 2, btnY + btnH / 2);

    this.exportButton = { x: btnX, y: btnY, width: btnW, height: btnH };

    pop();
  }

  drawPathEditMode() {
    push();

    // 绘制网格（显示红色不可建造区域作为参考）
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        let x = col * GRID_SIZE;
        let y = row * GRID_SIZE;

        // 检查是否可建造
        let canBuild = this.canBuildAt(col, row);

        if (!canBuild) {
          // 红色 = 石板路/障碍物（敌人应该走这里）
          fill(255, 100, 100, 60);
        } else {
          // 绿色 = 可建造区域
          fill(100, 255, 100, 30);
        }
        noStroke();
        rect(x, y, GRID_SIZE, GRID_SIZE);

        // 网格线
        stroke(255, 255, 255, 80);
        strokeWeight(1);
        noFill();
        rect(x, y, GRID_SIZE, GRID_SIZE);

        // 坐标文字
        fill(255, 255, 255, 150);
        noStroke();
        textSize(8);
        textAlign(CENTER, CENTER);
        text(`${col},${row}`, x + GRID_SIZE / 2, y + GRID_SIZE / 2);
      }
    }

    // 绘制已添加的路径点和连线
    if (this.pathPoints.length > 0) {
      // 连线
      stroke(255, 200, 0);
      strokeWeight(4);
      noFill();
      beginShape();
      for (let pt of this.pathPoints) {
        let x = pt.col * GRID_SIZE + GRID_SIZE / 2;
        let y = pt.row * GRID_SIZE + GRID_SIZE / 2;
        vertex(x, y);
      }
      endShape();

      // 路径点圆圈
      for (let i = 0; i < this.pathPoints.length; i++) {
        let pt = this.pathPoints[i];
        let x = pt.col * GRID_SIZE + GRID_SIZE / 2;
        let y = pt.row * GRID_SIZE + GRID_SIZE / 2;

        // 圆圈颜色：起点绿色，终点红色，中间黄色
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

        // 序号
        fill(0);
        noStroke();
        textSize(12);
        textAlign(CENTER, CENTER);
        text(i + 1, x, y);
      }
    }

    // 鼠标悬停高亮
    let mx = getGameMouseX();
    let my = getGameMouseY();
    let hoverCol = Math.floor(mx / GRID_SIZE);
    let hoverRow = Math.floor(my / GRID_SIZE);

    if (hoverCol >= 0 && hoverCol < COLS && hoverRow >= 0 && hoverRow < ROWS) {
      stroke(255, 255, 0);
      strokeWeight(3);
      noFill();
      rect(hoverCol * GRID_SIZE, hoverRow * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }

    // 顶部提示信息
    fill(0, 0, 0, 220);
    noStroke();
    rectMode(CORNER);
    rect(10, 10, 450, 120, 8);

    fill(255, 200, 0);
    textSize(18);
    textAlign(LEFT, TOP);
    text('🛤️ 路径编辑模式', 20, 18);

    fill(100, 255, 100);
    textSize(14);
    text('⏸ 游戏已暂停 - 怪物不会移动', 20, 42);

    fill(255, 255, 255);
    textSize(13);
    text('点击红色格子（石板路）按顺序添加路径点', 20, 65);
    text('按 Z：撤销上一个点  |  按 E：导出代码  |  按 N：退出', 20, 85);
    let coordText = (hoverCol >= 0 && hoverCol < COLS && hoverRow >= 0 && hoverRow < ROWS)
      ? `col=${hoverCol}, row=${hoverRow}` : '—';
    text(`当前: ${coordText}  |  已添加 ${this.pathPoints.length} 个点`, 20, 105);

    pop();
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

    // 使用 COLS/ROWS 确保网格与设计尺寸完全一致，从 (0,0) 开始无偏移
    let rows = ROWS;
    let cols = COLS;

    push();
    rectMode(CORNER);
    textAlign(CENTER, CENTER);

    // ── 1. Two-colour cell overlays + col,row labels ───────────────
    //   网格覆盖整个画布包括 HUD 区域，从 (0,0) 开始
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

    // ── 2. Grid lines — 从 (0,0) 到设计尺寸边界 ─────────────────────
    stroke(255, 255, 255, 55);
    strokeWeight(0.5);
    for (let c = 0; c <= cols; c++) {
      line(c * GRID_SIZE, 0, c * GRID_SIZE, DESIGN_HEIGHT);
    }
    for (let r = 0; r <= rows; r++) {
      line(0, r * GRID_SIZE, DESIGN_WIDTH, r * GRID_SIZE);
    }

    // ── 3. Mouse-cell info (top-left) — 使用设计坐标系 ─────────────
    let mCol     = Math.floor(getGameMouseX() / GRID_SIZE);
    let mRow     = Math.floor(getGameMouseY() / GRID_SIZE);
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

    // ===== 路径编辑模式优先处理 =====
    if (this.pathEditMode) {
      let col = Math.floor(mx / GRID_SIZE);
      let row = Math.floor(my / GRID_SIZE);

      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        // 添加新路径点
        this.pathPoints.push({ col: col, row: row });

        // 计算实际像素坐标（格子中心）
        let pixelX = col * GRID_SIZE + GRID_SIZE / 2;
        let pixelY = row * GRID_SIZE + GRID_SIZE / 2;

        console.log(`➕ 添加路径点 #${this.pathPoints.length}: col=${col}, row=${row} → (${pixelX}, ${pixelY})`);
      }
      return;
    }

    // ===== 地图编辑模式优先处理 =====
    if (this.mapEditMode && this.editGrid) {
      // 检查是否点击了导出按钮
      if (this.exportButton) {
        let btn = this.exportButton;
        if (mx >= btn.x && mx <= btn.x + btn.width &&
            my >= btn.y && my <= btn.y + btn.height) {
          console.log('点击导出按钮，正在导出...');
          this.exportGridCode();
          return;
        }
      }

      let col = Math.floor(mx / GRID_SIZE);
      let row = Math.floor(my / GRID_SIZE);

      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        if (this.editGrid[row][col] === 2) {
          this.editGrid[row][col] = 0;
          this.isDragging = true;
          this.dragValue = 0;
          console.log(`❌ [${col},${row}] → 不可建造`);
        } else {
          this.editGrid[row][col] = 2;
          this.isDragging = true;
          this.dragValue = 2;
          console.log(`✅ [${col},${row}] → 可建造`);
        }
      }
      return;
    }

    // ===== 主菜单状态：点击图片按钮 =====
    if (this.state === GameState.MENU) {
      this.ui.handleMenuClick(mx, my);
      return;
    }

    // ===== 关卡选择界面 =====
    if (this.state === GameState.LEVEL_SELECT) {
      // 检查返回按钮
      let backBtn = this.ui.backButton;
      if (backBtn &&
          mx > backBtn.x - backBtn.width / 2 && mx < backBtn.x + backBtn.width / 2 &&
          my > backBtn.y - backBtn.height / 2 && my < backBtn.y + backBtn.height / 2) {
        this.setState(GameState.MENU);
        return;
      }

      // 检查关卡按钮
      let levelBtns = this.ui.levelButtons;
      if (levelBtns) {
        for (let btn of levelBtns) {
          let left = btn.x - btn.width / 2;
          let right = btn.x + btn.width / 2;
          let top = btn.y - btn.height / 2;
          let bottom = btn.y + btn.height / 2;

          if (mx >= left && mx <= right && my >= top && my <= bottom) {
            if (btn.unlocked) {
              console.log(`Starting Level ${btn.level}: ${btn.name}`);
              this.startLevel(btn.level);
              return;
            } else {
              console.log(`Level ${btn.level} is locked`);
              return;
            }
          }
        }
      }
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

  handleMouseDrag(mx, my) {
    if (this.mapEditMode && this.isDragging && this.editGrid) {
      let col = Math.floor(mx / GRID_SIZE);
      let row = Math.floor(my / GRID_SIZE);

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
    let hovering = getGameMouseX() > btnX - btnW/2 && getGameMouseX() < btnX + btnW/2 &&
                   getGameMouseY() > btnY - btnH/2 && getGameMouseY() < btnY + btnH/2;

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
