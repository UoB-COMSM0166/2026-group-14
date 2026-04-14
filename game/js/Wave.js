// Wave — Single wave data container

class Wave {
  //@param {number} waveNumber    - Display number (1-based)
  //@param {Array}  enemyList     - [{type, hp, speed}, ...] one entry per enemy
  //@param {number} spawnInterval - Frames between each enemy spawn
  constructor(waveNumber, enemyList, spawnInterval) {
    this.waveNumber    = waveNumber;
    this.enemyList     = enemyList;
    this.spawnInterval = spawnInterval;
    this.completed     = false;
  }
}

// Helper: build a uniform block of enemy configs

function _enemies(count, type, hp, speed) {
  return Array.from({ length: count }, () => ({ type, hp, speed }));
}

function _buildEnemyList(groups) {
  let list = [];
  for (let group of groups) {
    list.push(..._enemies(group.count, group.type, group.hp, group.speed));
  }
  return list;
}

// Wave definitions per level

//Level 1 - 3 waves, escalating difficulty
function getLevel1Waves() {
  return LEVEL_1_WAVE_CONFIGS.map(config => {
    return new Wave(
      config.waveNumber,
      _buildEnemyList(config.enemies),
      config.spawnInterval
    );
  });
}

//Level 2 - River Thames Patrol
function getLevel2Waves() {
  return LEVEL_2_WAVE_CONFIGS.map(config => {
    return new Wave(
      config.waveNumber,
      _buildEnemyList(config.enemies),
      config.spawnInterval
    );
  });
}

//Level 3 - Tower of London Siege
function getLevel3Waves() {
  return LEVEL_3_WAVE_CONFIGS.map(config => {
    return new Wave(
      config.waveNumber,
      _buildEnemyList(config.enemies),
      config.spawnInterval
    );
  });
}
