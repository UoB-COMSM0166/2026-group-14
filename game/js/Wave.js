// Wave — Single wave data container

class Wave {
  //@param {number} waveNumber    - Display number (1-based)
  //@param {Array}  enemyList     - [{type, hp, speed}, ...] one entry per enemy
  //@param {number} spawnInterval - Frames between each enemy spawn
  constructor(waveNumber, enemyList, spawnInterval) {
    this.waveNumber = waveNumber;
    this.enemyList = enemyList;
    this.spawnInterval = spawnInterval;
    this.completed = false;
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
function _buildEnemyList(groups) {
  let list = [];
  for (let group of groups) {
    list.push(..._enemies(group.count, group.type, group.hp, group.speed));
  }
  return list;
}

function _scaleWaveGroups(groups, waveIndex, totalWaves) {
  const progress = totalWaves <= 1 ? 1 : waveIndex / (totalWaves - 1);

  let countOffset = 0;

  // 前期减少数量
  if (progress <= 0.20) {
    countOffset = -3;
  } else if (progress <= 0.40) {
    countOffset = -1;
  }
  // 后期稍微增强
  else if (progress >= 0.70) {
    countOffset = 3;
  }

  return groups.map(group => ({
    ...group,
    count: Math.max(1, group.count + countOffset),
    hp: group.hp,
    speed: group.speed
  }));
}

function _buildScaledWaves(levelConfigs) {
  return levelConfigs.map((config, index, arr) => {
    const scaledGroups = _scaleWaveGroups(config.enemies, index, arr.length);

    return new Wave(
      config.waveNumber,
      _buildEnemyList(scaledGroups),
      config.spawnInterval
    );
  });
}

// Level 1
function getLevel1Waves() {
  return _buildScaledWaves(LEVEL_1_WAVE_CONFIGS);
}

// Level 2
function getLevel2Waves() {
  return _buildScaledWaves(LEVEL_2_WAVE_CONFIGS);
}

// Level 3
function getLevel3Waves() {
  return _buildScaledWaves(LEVEL_3_WAVE_CONFIGS);
}