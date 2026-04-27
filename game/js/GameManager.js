// GameManager - Core game loop and state coordinator

class GameManager {
  constructor() {
    this.state = GameState.MENU;
    this.currentLevel = 1;

    // Save/profile system removed
    this.playerProfile = null;
    this.playerNickname = '';

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
    this.selectedTowerType = null;

    // Prevents click-through when an HTML button callback changes state in the
    // same event that also triggers the canvas mousePressed handler
    this.stateJustChanged = false;

    this.debugMode = false;
    this.currentMapImage = null;

    this.mapEditMode = false;
    this.debugBuildGrid = null;
    this.editGrid = null;
    this.isDragging = false;
    this.dragValue = 0;
    this.editSelectionStart = null;
    this.editSelectionCurrent = null;
    this.editSelectionMoved = false;

    this.pathEditMode = false;
    this.pathPoints = [];
    // Debug path editor cache: levelId -> [{col,row}, ...]
    this.debugPathPointsByLevel = {};

    this.editModePaused = false;
    this.manualPaused = false;

    // Tutorial system
    this.tutorialMode = false;
    this.tutorialStep = 0;
    this.tutorialComplete = false;

    this.confirmExit = false;

    this.dismantleMode = false;

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
        landmarkHp: LANDMARK_MAX_HP + 10,
        landmarkX: CANVAS_WIDTH - 100,
        landmarkY: CANVAS_HEIGHT / 2,
        initialGold: INITIAL_GOLD + 250,
        totalWaves: 6
      },
      3: {
        name: "Level 3 — Buckingham Palace",
        landmarkName: "Buckingham Palace",
        landmarkHp: LANDMARK_MAX_HP + 20,
        landmarkX: CANVAS_WIDTH - 100,
        landmarkY: CANVAS_HEIGHT / 2,
        initialGold: INITIAL_GOLD + 300,
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

  _loadActivePlayer() {
    this.playerNickname = '';
    this.playerProfile = null;
  }

  isLoggedIn() {
    return false;
  }

  login(nickname) {
    this.playerNickname = '';
    this.playerProfile = null;
    return true;
  }

  hasRunSave() {
    return false;
  }

  continueRun() {
    return false;
  }

  clearRunSave() {
    return false;
  }

  logout() {
    this.playerNickname = '';
    this.playerProfile = null;
  }

  getUnlockedUpTo() {
    return TOTAL_LEVELS;
  }

  canPlayLevel(levelId) {
    if (!Number.isFinite(levelId)) return false;
    if (levelId < 1 || levelId > TOTAL_LEVELS) return false;
    return true;
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

  getDefaultPathWaypoints(levelId) {
    const waypointFns = {
      1: getLevel1Waypoints,
      2: getLevel2Waypoints,
      3: getLevel3Waypoints
    };
    let waypointFn = waypointFns[levelId] || getLevel1Waypoints;
    return waypointFn();
  }

  tryStartLevel(levelId) {
    if (typeof ensureAudioStarted === 'function') ensureAudioStarted();
    if (!this.canPlayLevel(levelId)) {
      console.log(`[Game] Level ${levelId} does not exist.`);
      return false;
    }
    this.startLevel(levelId);
    if (this.isLoggedIn()) this._saveRunNow('start_level');
    return true;
  }

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
    this.path = new Path(this.getDefaultPathWaypoints(levelId));
    let savedPathPoints = this.debugPathPointsByLevel[levelId];
    if (savedPathPoints && savedPathPoints.length >= 2) {
      this.pathPoints = savedPathPoints.map(pt => ({ col: pt.col, row: pt.row }));
      this.applyPathPointsToLivePath(false);
    }

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
    this.selectedTowerType = null;
    this.availableTowers = LEVEL_AVAILABLE_TOWERS[levelId] || LEVEL_AVAILABLE_TOWERS[1];
    console.log(`[Game] Level ${levelId} available towers:`, this.availableTowers);

    this.mapEditMode = false;
    this.editGrid = null;
    this.debugBuildGrid = null;
    this.pathEditMode = false;
    this.pathPoints = [];
    this.editModePaused = false;
    this.manualPaused = false;

    this.setState(GameState.PLAYING);
    this._saveRunNow('start_level');
  }

  toggleMapEditMode() {
    this.mapEditMode = !this.mapEditMode;
    console.log('[Editor] mapEditMode:', this.mapEditMode);

    if (this.mapEditMode) {
      this.editModePaused = true;
      if (this.pathEditMode) this.togglePathEditMode();
      if (!this.debugBuildGrid) {
        this.debugBuildGrid = Array.from({ length: ROWS }, () => new Array(COLS).fill(2));
        console.log('[Editor] New draft grid: all green (first M this level)');
      } else {
        console.log('[Editor] Resuming saved draft grid (multi-step edit)');
      }
      this.editGrid = this.debugBuildGrid;
      this.exportButton = null;
      console.log('[Editor] Map edit mode enabled (game paused)');
      console.log('[Editor] Left/drag=RED  Right/drag=GREEN  M=exit  D=preview draft  E=export latest');
    } else {
      this.editModePaused = this.pathEditMode;
      this.editGrid = null;
      this.exportButton = null;
      this.isDragging = false;
      this.editSelectionStart = null;
      this.editSelectionCurrent = null;
      this.editSelectionMoved = false;
      console.log('[Editor] Map edit mode disabled (game resumed)');
    }
  }

  exportGridCode() {
    let grid = this.debugBuildGrid || this.editGrid;
    if (!grid) {
      console.log('[Editor] No draft grid — press M once to create a draft, then paint and export');
      return;
    }

    let obstacleCoords = [];
    let buildableCoords = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (grid[row][col] === 2) {
          buildableCoords.push([col, row]);
        } else {
          obstacleCoords.push([col, row]);
        }
      }
    }

    let levelNum = this.currentLevel || 1;
    console.log('='.repeat(60));
    console.log(`Level ${levelNum} - Edit export`);
    console.log(`  Buildable tiles: ${buildableCoords.length}`);
    console.log(`  Blocked tiles: ${obstacleCoords.length}`);
    console.log('');

    console.log('--- Blocked tile coordinates [col, row] ---');
    console.log(JSON.stringify(obstacleCoords));
    console.log('');

    console.log('--- Buildable tile whitelist [col, row] ---');
    console.log(JSON.stringify(buildableCoords));
    console.log('='.repeat(60));
    console.log('Tip: Right-click the JSON in the browser console to copy');
  }

  togglePathEditMode() {
    this.pathEditMode = !this.pathEditMode;

    if (this.pathEditMode) {
      this.editModePaused = true;
      let saved = this.debugPathPointsByLevel[this.currentLevel];
      if (saved && saved.length > 0) {
        this.pathPoints = saved.map(pt => ({ col: pt.col, row: pt.row }));
      } else {
        this.pathPoints = [];
      }
      if (this.mapEditMode) this.toggleMapEditMode();
      console.log('[Editor] Path edit mode enabled (game paused)');
      console.log('[Editor] Click cells to add waypoints in order');
      console.log('[Editor] Press Z: undo last point; C: clear; E: export path; N: apply+exit');
    } else {
      this.applyPathPointsToLivePath();
      this.editModePaused = this.mapEditMode;
      console.log('[Editor] Path edit mode disabled (game resumed)');
    }
  }

  applyPathPointsToLivePath(saveToLevel = true) {
    if (!this.pathPoints || this.pathPoints.length < 2) return false;

    const waypoints = this.pathPoints.map(pt => ({
      x: colToCenterX(pt.col),
      y: rowToCenterY(pt.row)
    }));
    this.path = new Path(waypoints);

    if (saveToLevel) {
      this.debugPathPointsByLevel[this.currentLevel] = this.pathPoints.map(pt => ({
        col: pt.col,
        row: pt.row
      }));
    }
    return true;
  }

  addPathPoint(col, row) {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
    const last = this.pathPoints[this.pathPoints.length - 1];
    if (last && last.col === col && last.row === row) return false;

    this.pathPoints.push({ col, row });
    this.applyPathPointsToLivePath();

    let pixelX = colToCenterX(col);
    let pixelY = rowToCenterY(row);
    console.log(`[Editor] Add waypoint #${this.pathPoints.length}: col=${col}, row=${row} -> (${pixelX}, ${pixelY})`);
    return true;
  }

  undoPathPoint() {
    if (!this.pathPoints || this.pathPoints.length === 0) return false;
    let removed = this.pathPoints.pop();
    console.log(`[Editor] Undo waypoint: col=${removed.col}, row=${removed.row}`);
    this.applyPathPointsToLivePath();
    return true;
  }

  clearPathPoints() {
    this.pathPoints = [];
    delete this.debugPathPointsByLevel[this.currentLevel];
    this.path = new Path(this.getDefaultPathWaypoints(this.currentLevel));
    console.log(`[Editor] Cleared path points for Level ${this.currentLevel}`);
  }

  exportPathCode() {
    if (this.pathPoints.length < 2) {
      console.log('[Editor] Too few waypoints, need at least 2');
      return;
    }

    let levelNum = this.currentLevel || 1;
    console.log('========== EXPORTED PATH CODE ==========');
    console.log('');
    console.log(`--- Path tile coordinates [col, row] (Level ${levelNum}) ---`);
    console.log(JSON.stringify(this.pathPoints.map(pt => [pt.col, pt.row])));
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
        this.economy.addGold(WAVE_CLEAR_BONUS_GOLD * 1.5);
        this.ui.showWaveBonus(`+${WAVE_CLEAR_BONUS_GOLD * 1.5} Wave Bonus!`);
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
    this._autoSaveTick();
  }

  _autoSaveTick() {
    return;
  }

  _saveRunNow(reason = 'manual') {
    return false;
  }

  _buildRunSave(reason) {
    let towers = (this.towers || []).map(t => ({
      type: t.type,
      x: t.x,
      y: t.y,
      anchorCol: t.anchorCol,
      anchorRow: t.anchorRow,
      disabled: !!t.disabled,
      disableTimer: t.disableTimer || 0,
      tauntDebuff: t.tauntDebuff || 0,
      tauntTimer: t.tauntTimer || 0,
      chargeStacks: t.chargeStacks || 0
    }));

    let enemies = (this.enemies || []).map(e => ({
      type: e.type,
      x: e.x,
      y: e.y,
      maxHp: e.maxHp,
      hp: e.hp,
      speed: e.speed,
      baseSpeed: e.baseSpeed,
      currentWaypointIndex: e.currentWaypointIndex,
      _alive: !e.isDead(),
      _reachedEnd: e.reachedEnd(),

      slowTimer: e.slowTimer || 0,
      isSlowed: !!e.isSlowed,
      isCharging: !!e.isCharging,
      chargeTimer: e.chargeTimer || 0,
      hasCharged: !!e.hasCharged,
      dodgeEffectTimer: e.dodgeEffectTimer || 0,
      leapTimer: e.leapTimer || 0,
      leapEffectTimer: e.leapEffectTimer || 0,
      diveTimer: e.diveTimer || 0,
      isDiving: !!e.isDiving,
      diveEffectTimer: e.diveEffectTimer || 0,
      healTimer: e.healTimer || 0,
      phase: e.phase || 1,
      summonTimer: e.summonTimer || 0,
      tauntTimer: e.tauntTimer || 0,

      poisonDamage: e.poisonDamage || 0,
      poisonTimer: e.poisonTimer || 0,
      weakened: !!e.weakened,
      weakenTimer: e.weakenTimer || 0,
      weakenBonus: e.weakenBonus || 0
    }));

    let wave = null;
    if (this.waveManager) {
      wave = {
        currentWaveIndex: this.waveManager.currentWaveIndex,
        enemiesSpawnedInWave: this.waveManager.enemiesSpawnedInWave,
        spawnTimer: this.waveManager.spawnTimer,
        waveState: this.waveManager.waveState,
        waitTimer: this.waveManager.waitTimer,
        allWavesComplete: !!this.waveManager.allWavesComplete
      };
    }

    return {
      version: 1,
      reason,
      savedAt: Date.now(),
      state: this.state,
      levelId: this.currentLevel,
      economyGold: this.economy ? this.economy.getGold() : null,
      landmarkHp: this.landmark ? this.landmark.hp : null,
      waveSurvived: this.waveSurvived || 0,
      totalKills: this.totalKills || 0,
      selectedTowerType: this.selectedTowerType || 'basic',
      towers,
      enemies,
      wave
    };
  }

  _restoreFromRunSave(run) {
    try {
      if (!run || !run.levelId) return false;
      if (!this.canPlayLevel(run.levelId)) return false;

      this.startLevel(run.levelId);

      if (this.economy && typeof run.economyGold === 'number') {
        this.economy.gold = run.economyGold;
      }
      if (this.landmark && typeof run.landmarkHp === 'number') {
        this.landmark.hp = Math.max(0, Math.min(run.landmarkHp, this.landmark.maxHp));
      }

      this.selectedTowerType = run.selectedTowerType || 'basic';
      this.waveSurvived = run.waveSurvived || 0;
      this.totalKills = run.totalKills || 0;

      this.towers = [];
      if (Array.isArray(run.towers)) {
        for (let t of run.towers) {
          if (!t || !t.type) continue;

          let tower = new Tower(t.x, t.y, t.type);

          tower.anchorCol = (typeof t.anchorCol === 'number')
            ? t.anchorCol
            : pixelToCol(t.x) - 1;

          tower.anchorRow = (typeof t.anchorRow === 'number')
            ? t.anchorRow
            : pixelToRow(t.y) - 1;

          tower.disabled = !!t.disabled;
          tower.disableTimer = t.disableTimer || 0;
          tower.tauntDebuff = t.tauntDebuff || 0;
          tower.tauntTimer = t.tauntTimer || 0;
          tower.chargeStacks = t.chargeStacks || 0;
          tower.lastTarget = null;

          this.towers.push(tower);

          if (this.mapGrid) {
            this.setFootprintOccupiedByColRow(tower.anchorCol, tower.anchorRow, true);
          }
        }
      }

      if (this.waveManager && run.wave) {
        this.waveManager.currentWaveIndex = run.wave.currentWaveIndex || 0;
        this.waveManager.enemiesSpawnedInWave = run.wave.enemiesSpawnedInWave || 0;
        this.waveManager.spawnTimer = run.wave.spawnTimer || 0;
        this.waveManager.waveState = run.wave.waveState || 'waiting';
        this.waveManager.waitTimer = run.wave.waitTimer || 180;
        this.waveManager.allWavesComplete = !!run.wave.allWavesComplete;
      }

      this.enemies = [];
      if (Array.isArray(run.enemies)) {
        for (let e of run.enemies) {
          if (!e || !e.type) continue;
          let enemy = new Enemy(this.path, { type: e.type, hp: e.maxHp, speed: e.baseSpeed }, this.sound);
          enemy.x = e.x;
          enemy.y = e.y;
          enemy.maxHp = e.maxHp;
          enemy.hp = e.hp;
          enemy.speed = e.speed;
          enemy.baseSpeed = e.baseSpeed;
          enemy.currentWaypointIndex = e.currentWaypointIndex;
          enemy._alive = !!e._alive;
          enemy._reachedEnd = !!e._reachedEnd;

          enemy.slowTimer = e.slowTimer || 0;
          enemy.isSlowed = !!e.isSlowed;
          enemy.isCharging = !!e.isCharging;
          enemy.chargeTimer = e.chargeTimer || 0;
          enemy.hasCharged = !!e.hasCharged;
          enemy.dodgeEffectTimer = e.dodgeEffectTimer || 0;
          enemy.leapTimer = e.leapTimer || 0;
          enemy.leapEffectTimer = e.leapEffectTimer || 0;
          enemy.diveTimer = e.diveTimer || 0;
          enemy.isDiving = !!e.isDiving;
          enemy.diveEffectTimer = e.diveEffectTimer || 0;
          enemy.healTimer = e.healTimer || 0;
          enemy.phase = e.phase || 1;
          enemy.summonTimer = e.summonTimer || 0;
          enemy.tauntTimer = e.tauntTimer || 0;

          enemy.poisonDamage = e.poisonDamage || 0;
          enemy.poisonTimer = e.poisonTimer || 0;
          enemy.weakened = !!e.weakened;
          enemy.weakenTimer = e.weakenTimer || 0;
          enemy.weakenBonus = e.weakenBonus || 0;

          this.enemies.push(enemy);
        }
      }

      this.setState(GameState.PLAYING);
      this._saveRunNow('restore');
      return true;
    } catch (e) {
      console.warn('[Save] Failed to restore run:', e);
      return false;
    }
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
      this._saveRunNow('before_lose');
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
        this._onVictory();
        this.setState(GameState.WIN);
        this.sound.play("win");
      }
    }
  }

  _onVictory() {
    return;
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
      case GameState.LOGIN:
        this.ui.drawLoginScreen();
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
          textSize(96);
          textStyle(BOLD);
          text("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
          textStyle(NORMAL);
          textSize(40);
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
    if (!bg || bg.width <= 0) return;

    const safeY = HUD_HEIGHT;
    const safeHeight = TOWER_PANEL_TOP - HUD_HEIGHT;

    image(
      bg,
      0, safeY, DESIGN_WIDTH, safeHeight,
      0, 0, bg.width, bg.height
    );
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

    if (this.confirmExit) {
      this.ui.drawExitConfirmationDialog();
    }

    this.drawHUD();
  }

  drawEditGrid() {
    push();
    rectMode(CORNER);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        let x = colToLeftX(col);
        let y = rowToTopY(row);

        if (this.editGrid[row][col] === 2) {
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

      let tileVal = this.editGrid[hoverRow][hoverCol];
      fill(0, 0, 0, 180);
      noStroke();
      rect(8, 54, 380, 22, 4);
      fill(tileVal === 2 ? color(80, 255, 120) : color(255, 110, 80));
      textSize(26);
      textAlign(LEFT, CENTER);
      text(`col=${hoverCol}, row=${hoverRow}  →  ${tileVal === 2 ? 'Buildable ✓' : 'Non-buildable ✗'}`, 16, 65);
    }

    if (this.mapEditMode && this.isDragging && this.editSelectionStart && this.editSelectionCurrent) {
      const minCol = Math.min(this.editSelectionStart.col, this.editSelectionCurrent.col);
      const maxCol = Math.max(this.editSelectionStart.col, this.editSelectionCurrent.col);
      const minRow = Math.min(this.editSelectionStart.row, this.editSelectionCurrent.row);
      const maxRow = Math.max(this.editSelectionStart.row, this.editSelectionCurrent.row);
      const selX = colToLeftX(minCol);
      const selY = rowToTopY(minRow);
      const selW = (maxCol - minCol + 1) * CURRENT_GRID_SIZE;
      const selH = (maxRow - minRow + 1) * CURRENT_GRID_SIZE;

      if (this.dragValue === 2) {
        fill(0, 255, 0, 50);
      } else {
        fill(255, 0, 0, 50);
      }
      noStroke();
      rect(selX, selY, selW, selH);
      stroke(255, 255, 0, 220);
      strokeWeight(3);
      noFill();
      rect(selX, selY, selW, selH);
    }

    fill(0, 0, 0, 210);
    noStroke();
    rect(10, 10, 620, 64, 8);

    fill(255, 255, 0);
    textSize(26);
    textAlign(LEFT, CENTER);
    text('Map Edit Mode  [M: exit]', 18, 26);

    fill(220, 220, 220);
    textSize(20);
    text('Left click/drag = red (blocked), right click/drag = green (buildable)', 18, 48);
    text('D = preview draft, E = export latest', 18, 64);

    let btnX = DESIGN_WIDTH - 210;
    let btnY = 12;
    let btnW = 195;
    let btnH = 38;

    let hovered = mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH;
    fill(hovered ? 70 : 40, hovered ? 180 : 140, 50);
    stroke(180, 255, 180);
    strokeWeight(2);
    rect(btnX, btnY, btnW, btnH, 6);

    fill(255);
    noStroke();
    textSize(26);
    textAlign(CENTER, CENTER);
    text('Export Coordinates (E)', btnX + btnW / 2, btnY + btnH / 2);

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
        textSize(16);
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
        textSize(24);
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
    textSize(36);
    textAlign(LEFT, TOP);
    text('Path Edit Mode', 20, 18);

    fill(100, 255, 100);
    textSize(28);
    text('Game paused - enemies not moving', 20, 42);

    fill(255, 255, 255);
    textSize(26);
    text('Click grid cells to add waypoints in order', 20, 65);
    text('Z: undo  |  C: clear  |  E: export  |  N: apply+exit', 20, 85);
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

  getTowerCenterXFromAnchor(col) {
    return colToCenterX(col) + CURRENT_GRID_SIZE / 2;
  }

  getTowerCenterYFromAnchor(row) {
    return rowToCenterY(row) + CURRENT_GRID_SIZE / 2;
  }

  getFootprintCells(col, row, towerType = this.selectedTowerType) {
    let w = 2;
    let h = 2;
    let cells = [];

    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        cells.push({ col: col + dx, row: row + dy });
      }
    }
    return cells;
  }

  getFootprintCells(col, row, towerType = this.selectedTowerType) {
    let w = 2;
    let h = 2;
    let cells = [];

    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        cells.push({ col: col + dx, row: row + dy });
      }
    }
    return cells;
  }

  setFootprintOccupiedByColRow(col, row, occupied = true) {
    if (!this.mapGrid) return;

    let cells = this.getFootprintCells(col, row);
    for (let cell of cells) {
      let c = cell.col;
      let r = cell.row;

      if (r >= 0 && r < this.mapGrid.length && c >= 0 && c < this.mapGrid[0].length) {
        if (occupied) {
          this.mapGrid[r][c] = TILE_TYPES.OCCUPIED;
        } else {
          if (this.mapGrid[r][c] === TILE_TYPES.OCCUPIED) {
            this.mapGrid[r][c] = TILE_TYPES.GRASS;
          }
        }
      }
    }
  }

  canBuildAt(col, row) {
    if (!this.mapGrid) return false;

    let cells = this.getFootprintCells(col, row);

    for (let cell of cells) {
      let c = cell.col;
      let r = cell.row;

      if (r < 0 || r >= this.mapGrid.length) return false;
      if (c < 0 || c >= this.mapGrid[0].length) return false;

      let cellCenterY = rowToCenterY(r);
      if (cellCenterY < HUD_HEIGHT) return false;

      if (this.mapGrid[r][c] !== TILE_TYPES.GRASS) return false;
    }

    return true;
  }

  /**
   * Debug overlay (D key). Does not affect gameplay.
   * If debugBuildGrid exists (after first M this level), colours follow the M-draft;
   * otherwise they follow mapGrid (GRASS vs other).
   */
  drawDebugGrid() {
    if (!this.debugMode) return;

    push();
    rectMode(CORNER);

    const draft = this.debugBuildGrid;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let x = GRID_OFFSET_X + c * CURRENT_GRID_SIZE;
        let y = GRID_OFFSET_Y + r * CURRENT_GRID_SIZE;

        let isBuildableCell = draft
          ? (draft[r][c] === 2)
          : (this.mapGrid && this.mapGrid[r] && this.mapGrid[r][c] === TILE_TYPES.GRASS);
        if (isBuildableCell) {
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
          textSize(20);
          textAlign(CENTER, TOP);
          text(c, x + CURRENT_GRID_SIZE / 2, y + 2);
        }
        if (c === 0) {
          fill(255, 255, 0, 200);
          noStroke();
          textSize(20);
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
    let draftCellOk = draft && mRow >= 0 && mRow < ROWS && mCol >= 0 && mCol < COLS
      ? (draft[mRow][mCol] === 2)
      : null;
    let draftLabel = draftCellOk === true ? 'green' : draftCellOk === false ? 'red' : '—';
    let hoverLine = draft
      ? `col=${mCol}, row=${mRow} | draft: ${draftLabel} | game map: ${mapVal}`
      : `Grid: col=${mCol}, row=${mRow} | canBuild: ${canBuild} | mapValue: ${mapVal}`;

    noStroke();
    textSize(26);
    textAlign(LEFT, CENTER);
    fill(0, 0, 0, 180);
    rect(8, 54, 520, 22, 4);
    fill(draftCellOk === false ? color(255, 110, 80) : (draftCellOk === true ? color(80, 255, 120) : (canBuild ? color(80, 255, 120) : color(255, 110, 80))));
    text(hoverLine, 16, 65);

    fill(0, 0, 0, 200);
    noStroke();
    rectMode(CORNER);
    rect(5, 80, 320, draft ? 200 : 180, 5);

    fill(255, 255, 0);
    textSize(26);
    textAlign(LEFT, TOP);
    let y = 88;
    text('Level: ' + this.currentLevel, 12, y); y += 20;
    if (draft) {
      fill(180, 255, 180);
      textSize(22);
      text('D = M-draft overlay (not gameplay)', 12, y); y += 18;
      fill(255, 255, 0);
      textSize(26);
    }
    text('GRID_OFFSET_X: ' + GRID_OFFSET_X, 12, y); y += 20;
    text('GRID_OFFSET_Y: ' + GRID_OFFSET_Y, 12, y); y += 20;
    text('GRID_SIZE: ' + CURRENT_GRID_SIZE, 12, y); y += 25;

    fill(200, 200, 200);
    textSize(22);
    text('Controls:', 12, y); y += 15;
    text('Arrow Keys = Adjust offset', 12, y); y += 15;
    text('- / = = Adjust grid size', 12, y); y += 15;
    text('P = Print config to console', 12, y);
    if (draft) {
      y += 15;
      text('M = edit draft  E = export draft', 12, y);
    }

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

  handleClick(mx, my, btn) {
    // Guard against click-through: if state just changed this same event
    // (e.g. an HTML button callback already fired startLevel/setState),
    // drop this canvas-level click entirely
    if (this.stateJustChanged) return;

    if (this.pathEditMode) {
      let col = pixelToCol(mx);
      let row = pixelToRow(my);

      this.addPathPoint(col, row);
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
        let val = (btn === RIGHT) ? 2 : 0;
        this.editGrid[row][col] = val;
        this.isDragging = true;
        this.dragValue = val;
        this.editSelectionStart = { col, row };
        this.editSelectionCurrent = { col, row };
        this.editSelectionMoved = false;
        console.log(`[Editor] [${col},${row}] -> ${val === 2 ? 'Buildable ✓' : 'Non-buildable ✗'}`);
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
      let btnIdx = this.ui.getClickedMenuButton(mx, my);

      if (btnIdx === 0) {
        this.setState(GameState.LEVEL_SELECT);
      } else if (btnIdx === 1) {
        this.setState(GameState.SETTINGS);
      } else if (btnIdx === 2) {
        window.location.href = "https://github.com/UoB-COMSM0166/2026-group-14";
      }
      return;
    }

    if (this.state === GameState.LOGIN) {
      this.ui.handleLoginClick(mx, my);
      return;
    }

    if (this.state === GameState.LEVEL_SELECT) {
      // Level select debug mode: click + drag to export a rectangle
      if (this.ui.levelSelectDebug) {
        const startX = Math.round(mx);
        const startY = Math.round(my);
        this.ui.levelSelectDebugDragging = true;
        this.ui.levelSelectDebugDragStart = { x: startX, y: startY };
        this.ui.levelSelectDebugDragCurrent = { x: startX, y: startY };
        console.log('[Debug][LevelSelect] Drag start: x=' + startX + ', y=' + startY);
        return;
      }

      // Game Instructions button — starts Level 1 with tutorial
      let instrBtnX = 636;
      let instrBtnY = 750;
      let instrBtnW = 328;
      let instrBtnH = 55;

      if (mx >= instrBtnX && mx <= instrBtnX + instrBtnW &&
        my >= instrBtnY && my <= instrBtnY + instrBtnH) {
        this.sound.play("click1");
        this.tryStartLevel(1);
        this.startTutorial();
        return;
      }

      let menuBtnX = 995;
      let menuBtnY = 760;
      let menuBtnW = 417;
      let menuBtnH = 63;

      if (mx >= menuBtnX && mx <= menuBtnX + menuBtnW && my >= menuBtnY && my <= menuBtnY + menuBtnH) {
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
              this.tryStartLevel(btn.level);
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
      const startX = Math.round(mx);
      const startY = Math.round(my);
      this.ui.tutorialDebugDragging = true;
      this.ui.tutorialDebugDragStart = { x: startX, y: startY };
      this.ui.tutorialDebugDragCurrent = { x: startX, y: startY };
      console.log('[Tutorial Debug] Drag start: x=' + startX + ', y=' + startY);
      return;
    }

    if (this.state === GameState.PLAYING && this.tutorialMode) {
      if (this.ui.tutorialSkipBtn) {
        let btn = this.ui.tutorialSkipBtn;
        if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
          this.sound.play("click1");
          this.skipTutorial();
          return;
        }
      }
      // Any click advances tutorial
      this.sound.play("click1");
      this.nextTutorialStep();
      return;
    }

    if (this.state === GameState.PLAYING) {
      if (this.confirmExit) {
        if (this.ui.exitConfirmYesBtn &&
          mx >= this.ui.exitConfirmYesBtn.x && mx <= this.ui.exitConfirmYesBtn.x + this.ui.exitConfirmYesBtn.w &&
          my >= this.ui.exitConfirmYesBtn.y && my <= this.ui.exitConfirmYesBtn.y + this.ui.exitConfirmYesBtn.h) {
          this.sound.play("click1");
          this.confirmExit = false;
          this.returnToMenu();
          return;
        }
        if (this.ui.exitConfirmNoBtn &&
          mx >= this.ui.exitConfirmNoBtn.x && mx <= this.ui.exitConfirmNoBtn.x + this.ui.exitConfirmNoBtn.w &&
          my >= this.ui.exitConfirmNoBtn.y && my <= this.ui.exitConfirmNoBtn.y + this.ui.exitConfirmNoBtn.h) {
          this.sound.play("click1");
          this.confirmExit = false;
          return;
        }
        this.confirmExit = false;
        return;
      }

      if (this.ui.inGameBackBtn) {
        let btn = this.ui.inGameBackBtn;
        if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
          this.sound.play("click1");
          this.confirmExit = true;
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
      if (my < HUD_HEIGHT) return;

      if (this.dismantleMode) {
        console.log(`[Game] Attempting to dismantle at (${mx}, ${my})`);
        let removed = this.removeTower(mx, my);
        if (removed) {
          this.dismantleMode = false;
          cursor(ARROW);
        }
        return;
      }

      if (!this.selectedTowerType) return;

      let col = pixelToCol(mx);
      let row = pixelToRow(my);
      let gridX = this.getTowerCenterXFromAnchor(col);
      let gridY = this.getTowerCenterYFromAnchor(row);

      if (this.debugMode) {
        let rawTile = this.mapGrid ? (this.mapGrid[row] ? this.mapGrid[row][col] : 'OOB') : 'no-grid';
        let canBuild = this.canBuildAt(col, row);
        console.log(`[Debug] Click at col=${col}, row=${row}, canBuild=${canBuild}, rawTile=${rawTile}`);
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

      this.tryPlaceTower(this.selectedTowerType, col, row, gridX, gridY);
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
    if (this.state === GameState.PLAYING &&
      this.tutorialMode &&
      this.ui.tutorialDebugMode &&
      this.ui.tutorialDebugDragging &&
      this.ui.tutorialDebugDragStart) {
      this.ui.tutorialDebugDragCurrent = { x: Math.round(mx), y: Math.round(my) };
      return;
    }

    if (this.state === GameState.LEVEL_SELECT &&
      this.ui.levelSelectDebug &&
      this.ui.levelSelectDebugDragging &&
      this.ui.levelSelectDebugDragStart) {
      this.ui.levelSelectDebugDragCurrent = { x: Math.round(mx), y: Math.round(my) };
      return;
    }

    if (this.mapEditMode && this.isDragging && this.editGrid) {
      let col = pixelToCol(mx);
      let row = pixelToRow(my);

      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        this.editSelectionCurrent = { col, row };
        if (
          this.editSelectionStart &&
          (col !== this.editSelectionStart.col || row !== this.editSelectionStart.row)
        ) {
          this.editSelectionMoved = true;
        }
      }
    }
  }

  handleMouseUp() {
    if (this.state === GameState.PLAYING &&
      this.tutorialMode &&
      this.ui.tutorialDebugMode &&
      this.ui.tutorialDebugDragging &&
      this.ui.tutorialDebugDragStart &&
      this.ui.tutorialDebugDragCurrent) {
      const start = this.ui.tutorialDebugDragStart;
      const current = this.ui.tutorialDebugDragCurrent;
      const x = Math.min(start.x, current.x);
      const y = Math.min(start.y, current.y);
      const w = Math.abs(current.x - start.x);
      const h = Math.abs(current.y - start.y);

      console.log('='.repeat(50));
      console.log('[Tutorial Debug] HIGHLIGHT AREA for step "' +
        TUTORIAL_STEPS[this.tutorialStep].id + '":');
      console.log('{ x: ' + x + ', y: ' + y + ', w: ' + w + ', h: ' + h + ' }');
      console.log('='.repeat(50));

      this.ui.tutorialDebugLastRect = { x, y, w, h };
      this.ui.tutorialDebugDragging = false;
      this.ui.tutorialDebugDragStart = null;
      this.ui.tutorialDebugDragCurrent = null;
      this.ui.tutorialDebugClicks = [];
      return;
    }

    if (this.state === GameState.LEVEL_SELECT &&
      this.ui.levelSelectDebug &&
      this.ui.levelSelectDebugDragging &&
      this.ui.levelSelectDebugDragStart &&
      this.ui.levelSelectDebugDragCurrent) {
      const start = this.ui.levelSelectDebugDragStart;
      const current = this.ui.levelSelectDebugDragCurrent;
      const x = Math.min(start.x, current.x);
      const y = Math.min(start.y, current.y);
      const w = Math.abs(current.x - start.x);
      const h = Math.abs(current.y - start.y);

      this.ui.levelSelectDebugLastRect = { x, y, w, h };
      console.log('='.repeat(56));
      console.log('[Debug][LevelSelect] BOX SELECTION');
      console.log(`rect: { x: ${x}, y: ${y}, w: ${w}, h: ${h} }`);
      console.log(`highlightArea: { x: ${x}, y: ${y}, w: ${w}, h: ${h} }`);
      console.log('='.repeat(56));

      this.ui.levelSelectDebugDragging = false;
      this.ui.levelSelectDebugDragStart = null;
      this.ui.levelSelectDebugDragCurrent = null;
      return;
    }

    if (this.mapEditMode && this.editGrid && this.isDragging && this.editSelectionStart && this.editSelectionCurrent) {
      const minCol = Math.min(this.editSelectionStart.col, this.editSelectionCurrent.col);
      const maxCol = Math.max(this.editSelectionStart.col, this.editSelectionCurrent.col);
      const minRow = Math.min(this.editSelectionStart.row, this.editSelectionCurrent.row);
      const maxRow = Math.max(this.editSelectionStart.row, this.editSelectionCurrent.row);

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          this.editGrid[row][col] = this.dragValue;
        }
      }

      if (this.editSelectionMoved) {
        let label = this.dragValue === 2 ? 'Buildable ✓' : 'Non-buildable ✗';
        console.log(`[Editor] Box ${label}: col ${minCol}-${maxCol}, row ${minRow}-${maxRow}`);
      }
    }

    this.isDragging = false;
    this.editSelectionStart = null;
    this.editSelectionCurrent = null;
    this.editSelectionMoved = false;
  }
  tryPlaceTower(towerType, anchorCol, anchorRow, x, y) {
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

    tower.anchorCol = anchorCol;
    tower.anchorRow = anchorRow;

    this.towers.push(tower);

    if (this.mapGrid) {
      this.setFootprintOccupiedByColRow(anchorCol, anchorRow, true);
    }

    console.log(`[Game] Placed ${towerType} tower at center=(${x}, ${y}), anchor=(${anchorCol}, ${anchorRow})`);
    this.sound.play("place");
    this._saveRunNow('place_tower');
    return true;
  }

  removeTower(x, y) {
    console.log(`[Game] Checking for tower near click (${x}, ${y})`);

    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = this.towers.length - 1; i >= 0; i--) {
      let tower = this.towers[i];
      let fw = (tower.footprintW || 2) * CURRENT_GRID_SIZE;
      let fh = (tower.footprintH || 2) * CURRENT_GRID_SIZE;
      let halfW = fw / 2;
      let halfH = fh / 2;
      if (x >= tower.x - halfW && x <= tower.x + halfW &&
        y >= tower.y - halfH && y <= tower.y + halfH) {
        let dx = tower.x - x;
        let dy = tower.y - y;
        let d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
    }

    if (bestIdx === -1) {
      console.log(`[Game] No tower found at click (${x}, ${y})`);
      return false;
    }

    let tower = this.towers[bestIdx];
    let config = TOWER_TYPES[tower.type];
    let refund = Math.floor(config.cost * 0.7);
    this.economy.addGold(refund);
    this.towers.splice(bestIdx, 1);

    if (this.mapGrid) {
      this.setFootprintOccupiedByColRow(tower.anchorCol, tower.anchorRow, false);
    }

    console.log(`[Game] Removed ${tower.type} tower at (${tower.x}, ${tower.y}), refunded ${refund} gold`);
    this.sound.play("bonus", 0.65);

    if (this.ui && typeof this.ui.showDismantleRefund === 'function') {
      this.ui.showDismantleRefund(refund, x, y);
    }

    this._saveRunNow('remove_tower');
    return true;
  }

  setSelectedTowerType(towerType) {
    if (!TOWER_TYPES[towerType]) return;
    this.selectedTowerType = towerType;
    this.dismantleMode = false; // Exit dismantle mode when selecting a tower
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
    console.log("[Game] Returning to Level Selection...");

    if (this.isLoggedIn()) this.clearRunSave();

    this.towers = [];
    this.projectiles = [];
    this.enemies = [];
    this.selectedTowerType = null;
    this.dismantleMode = false;
    this.confirmExit = false;

    if (this.waveManager) {
      this.waveManager.stop();
    }

    this.setState(GameState.LEVEL_SELECT);
    this.sound.stopAll();
    this.sound.playTrack("menu");

    cursor(ARROW);
    this.ui.hideAll();
  }
  nextLevel() {
    if (this.currentLevel < TOTAL_LEVELS) {
      this.tryStartLevel(this.currentLevel + 1);
    } else {
      console.log("[Game] All levels complete!");
      this.returnToMenu();
    }
  }

  drawMenu() {
    background(20, 60, 20);

    fill(255, 215, 0);
    textAlign(CENTER, CENTER);
    textSize(144);
    text("DEFEND BRITAIN", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    textSize(96);
    text("UK", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 - 80);

    fill(200, 200, 200);
    textSize(48);
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
    textSize(56);
    text("▶  START GAME", btnX, btnY);

    fill(120);
    textSize(32);
    text("Press 1, 2, 3 to select level", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);

    fill(80);
    textSize(28);
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
