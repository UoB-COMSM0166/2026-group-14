// ========================================
// Enemy — Enemy behaviour (stub for teammate)
// ========================================
import { ENEMY_KILL_REWARD, ENEMY_REACH_DAMAGE } from './constants.js';

class Enemy {
    constructor(health, speed, type, path){
        this.health = health;
        this.speed = speed;
        this.type = type;
        this.path = path;
        this.position = createVector(path[0].x, path[0].y);
        this.currentWayPoint = 0;
    }
    move(){
        if(this.currentWayPoint < this.path.length){
            const target = this.path[this.currentWayPoint + 1];
            const dir = Vector.sub(target,this.position).normalize();
            this.position.add(dir.mult(this.speed));
            const d = dist(this.position.x, this.position.y, target.x, target.y);
            if(d < 5){
                this.currentWayPoint++;
            }
        }
    }

    takeDamage(damage){
        this.health -= damage;
    }

    dieByPlayer(player, enemies){
        const reward = ENEMY_KILL_REWARD[this.type];
        player.addGold(reward);
        return enemies.filter(enemy => enemy !== this);

    }

    dieByEnd(landmark, enemies){
        landmark.takeDamage(ENEMY_REACH_DAMAGE);
        return enemies.filter(enemy => enemy !== this);
    }

    isDead() {
        return this.health <= 0;
    }

    reachedEnd() {
        return this.currentWayPoint >= this.path.length;
    }
}
