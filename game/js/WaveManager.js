// WaveManager - Controls wave spawning flow

class WaveManager {
  /**
   * @param {Wave[]} waves - Ordered array of Wave objects for this level
   */
  constructor(waves) {
    this.waves = waves;

    this.currentWaveIndex     = 0;
    this.enemiesSpawnedInWave = 0;
    this.spawnTimer           = 0;

    // "waiting" | "spawning" | "active"
    this.waveState            = 'waiting';

    // First wave: 3 s prep time (180 frames @ 60 fps)
    this.waitTimer            = 180;

    this.allWavesComplete     = false;
    this._waveClearedThisFrame = false;
    this._stopped = false;
  }

  // ----------------------------------------
  // update() — called every frame by GameManager (BEFORE enemy loop)
  // @param {Enemy[]} enemies - live reference to game.enemies array
  // @param {Path}    path    - current level path
  // ----------------------------------------
  update(enemies, path) {
    this._waveClearedThisFrame = false;

    if (this._stopped || this.allWavesComplete) return;

    let wave = this.waves[this.currentWaveIndex];

    // ── "waiting": count down then start spawning ────────────────────────
    if (this.waveState === 'waiting') {
      this.waitTimer--;
      if (this.waitTimer <= 0) {
        this.waveState  = 'spawning';
        this.spawnTimer = 0; // spawn first enemy immediately
        console.log(`[Game] Wave ${wave.waveNumber} starting`);
      }
    }

    // ── "spawning": release enemies one at a time ────────────────────────
    else if (this.waveState === 'spawning') {
      this.spawnTimer--;

      if (this.spawnTimer <= 0) {
        let config = wave.enemyList[this.enemiesSpawnedInWave];
        enemies.push(new Enemy(path, config));
        this.enemiesSpawnedInWave++;
        this.spawnTimer = wave.spawnInterval;

        // All enemies in this wave have been released
        if (this.enemiesSpawnedInWave >= wave.enemyList.length) {
          wave.completed = true;
          this.waveState = 'active';
          console.log(`[Game] Wave ${wave.waveNumber} fully spawned`);
        }
      }
    }

    // ── "active": wait until the field is clear ──────────────────────────
    else if (this.waveState === 'active') {
      // Count enemies that are still alive and haven't reached the end
      let remaining = enemies.filter(e => !e.isDead() && !e.reachedEnd());

      if (remaining.length === 0) {
        this._waveClearedThisFrame = true;
        this.currentWaveIndex++;

        if (this.currentWaveIndex >= this.waves.length) {
          this.allWavesComplete = true;
          console.log('[Game] All waves complete - victory!');
        } else {
          // Reset for the next wave (5 s gap = 300 frames)
          this.waveState            = 'waiting';
          this.waitTimer            = 300;
          this.enemiesSpawnedInWave = 0;
          this.spawnTimer           = 0;
          console.log(`[Game] Preparing wave ${this.waves[this.currentWaveIndex].waveNumber}`);
        }
      }
    }
  }

  consumeWaveClearEvent() {
    let wasCleared = this._waveClearedThisFrame;
    this._waveClearedThisFrame = false;
    return wasCleared;
  }

  // ----------------------------------------
  // Display helpers (called by UIHUD)
  // ----------------------------------------

  /** Returns e.g. "Wave 1 / 3" */
  getCurrentWaveDisplay() {
    let displayIndex = Math.min(this.currentWaveIndex + 1, this.waves.length);
    return `Wave ${displayIndex} / ${this.waves.length}`;
  }

  /** Returns a short status string for the HUD */
  getWaveStateText() {
    if (this.allWavesComplete) return 'All clear!';

    if (this.waveState === 'waiting') {
      let secs = Math.ceil(this.waitTimer / 60);
      return `Next wave in ${secs}s`;
    }
    if (this.waveState === 'spawning') {
      let wave = this.waves[this.currentWaveIndex];
      return `Wave ${wave.waveNumber} incoming!`;
    }
    if (this.waveState === 'active') {
      return `Wave ${this.waves[this.currentWaveIndex].waveNumber} active`;
    }
    return '';
  }

  isFinished() {
    return this.allWavesComplete;
  }

  stop() {
    this._stopped = true;
    this.waveState = 'stopped';
  }
}
