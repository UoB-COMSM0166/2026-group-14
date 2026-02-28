import { WAVES, ENEMY_SPAWN_INTERVAL } from './constants.js';
import { BasicEnemy, FastEnemy, TankEnemy, BossEnemy } from './Enemy.js';

class WaveManager {
  constructor(game) {
    this.game = game;
    this.currentWave = 0;
    this.waves = WAVES;
  }
  startNextWave(){
    if(this.currentWave >= this.waves.length){
        return;
    }
    const currentWaveEnemies = this.waves[this.currentWave];
    this.currentWave++;
    let delay = 0;
    currentWaveEnemies.forEach(({type, count}) =>{
        for(let i = 0;i<count;i++){
            setTimeout(() => {
                this.spawnEnemy(type);
            }, delay);
            delay += ENEMY_SPAWN_INTERVAL;
        }
    });
  }

  spawnEnemy(type){
    const path = this.game.map.path;
    let enemy = null;
    switch(type){
        case 'basic':
            enemy = new BasicEnemy(path);
            break;
        case 'fast':
            enemy = new FastEnemy(path);
            break;
        case 'tank':
            enemy = new TankEnemy(path);
            break;
        case 'boss':
            enemy = new BossEnemy(path);
            break;
    }
    if(enemy){
        this.game.enemies.push(enemy);
    }
  }

    isWaveFinished(){ 
        return this.game.enemies.length === 0; 
    }
}

export{ WaveManager};
