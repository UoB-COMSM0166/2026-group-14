// ========================================
// Tower — Tower behaviour (stub for teammate)
// ========================================

class Tower {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.range = 120;    
    this.damage = 10;    
    this.level = 1; 
    
    // --- 你需要新增的属性 ---
    this.fireRate = 60;   // 攻击间隔（假设60帧为1秒）
    this.cooldown = 0;    // 当前冷却计时
  }

  // 引擎每帧会调用这个方法，并把当前的怪物数组传进来
  update(enemies) {
    // 1. 处理冷却时间
    if (this.cooldown > 0) {
      this.cooldown--;
    }

    // 2. 寻找目标怪物
    let target = this.findTarget(enemies);

    // 3. 如果有目标，且冷却完毕，就进行攻击
    if (target && this.cooldown <= 0) {
      this.attack(target);
      this.cooldown = this.fireRate; // 重新进入冷却
    }
  }

  // --- 你需要新增的：索敌逻辑 ---
  findTarget(enemies) {
    // 遍历所有怪物，找到距离在攻击范围内的第一个怪物返回
    for (let enemy of enemies) {
      let d = dist(this.x, this.y, enemy.x, enemy.y); 
      if (d <= this.range) {
        return enemy;
      }
    }
    return null; // 没找到则返回空
  }

  // --- 你需要新增的：攻击逻辑 ---
  attack(enemy) {
    // 假设怪物有 takeDamage 方法（根据队长的设计图）
    if (enemy && enemy.takeDamage) {
      enemy.takeDamage(this.damage);
      console.log("塔开火了！造成伤害: " + this.damage);
    }
  }

  // 队友写好的绘制逻辑（保持原样，不用动）
  draw() {
    // 攻击范围圈（半透明蓝色）
    fill(100, 150, 255, 30);
    stroke(100, 150, 255, 80);
    strokeWeight(1);
    ellipse(this.x, this.y, this.range * 2, this.range * 2);

    // 塔底座（深灰色方块）
    noStroke();
    fill(60, 60, 80);
    rectMode(CENTER);
    rect(this.x, this.y, GRID_SIZE - 8, GRID_SIZE - 8, 5);

    // 塔炮管（蓝色）
    fill(50, 120, 220);
    rect(this.x, this.y - 8, 14, 22, 3);

    // 等级标记
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(11);
    text("Lv1", this.x, this.y + 14);

    rectMode(CORNER);
  }
}