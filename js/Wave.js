// ========================================
// Wave — Single wave data container
// ========================================

class Wave {
  /**
   * @param {number} waveNumber    - Display number (1-based)
   * @param {Array}  enemyList     - [{type, hp, speed}, ...] one entry per enemy
   * @param {number} spawnInterval - Frames between each enemy spawn
   */
  constructor(waveNumber, enemyList, spawnInterval) {
    this.waveNumber    = waveNumber;
    this.enemyList     = enemyList;
    this.spawnInterval = spawnInterval;
    this.completed     = false;
  }
}

// ========================================
// Helper: build a uniform block of enemy configs
// ========================================
function _enemies(count, type, hp, speed) {
  return Array.from({ length: count }, () => ({ type, hp, speed }));
}

// ========================================
// Wave definitions per level
// ========================================

/**
 * Level 1 — 3 waves, escalating difficulty
 */
function getLevel1Waves() {
  return [
    new Wave(1,
      _enemies(5, 'basic', 100, 2),
      60   // 1 enemy per second
    ),
    new Wave(2,
      [
        ..._enemies(5, 'basic', 100, 2),
        ..._enemies(3, 'fast',   60, 3.5)
      ],
      50
    ),
    new Wave(3,
      [
        ..._enemies(6, 'basic', 100, 2  ),
        ..._enemies(3, 'fast',   60, 3.5),
        ..._enemies(3, 'tank',  250, 1.2)
      ],
      40
    )
  ];
}

/**
 * Level 2 — placeholder (same as level 1 for now)
 */
function getLevel2Waves() {
  return getLevel1Waves();
}

/**
 * Level 3 — placeholder (same as level 1 for now)
 */
function getLevel3Waves() {
  return getLevel1Waves();
}
