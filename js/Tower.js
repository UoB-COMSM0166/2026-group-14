// ========================================
// Tower — Placement, targeting, and firing
// ========================================

class Tower {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.level = 1;

    let stats = TOWER_TYPES[type] || TOWER_TYPES.basic;
    this.config = stats;
    this.range = stats.range;
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.color = stats.color;
    this.bulletColor = stats.bulletColor;
    this.size = stats.size || 18;
    this.slowEffect = stats.slowEffect || 1;
    this.slowDuration = stats.slowDuration || 0;
    this.splashRadius = stats.splashRadius || this.range;

    this.fireTimer = 0;
    this.target = null;
    this.projectiles = [];
    this.areaPulseTimer = 0;
    this.areaPulseDuration = 18;
  }

  // ----------------------------------------
  // Helpers
  // ----------------------------------------

  getDistanceTo(enemy) {
    let dx = enemy.x - this.x;
    let dy = enemy.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isInRange(enemy) {
    return this.getDistanceTo(enemy) <= this.range;
  }

  // ----------------------------------------
  // update(enemies) — called every frame by GameManager
  // ----------------------------------------
  update(enemies) {
    if (this.type === 'area') {
      this.updateAreaAttack(enemies);
    } else {
      this.updateProjectileAttack(enemies);
    }

    if (this.fireTimer > 0) this.fireTimer--;
    if (this.areaPulseTimer > 0) this.areaPulseTimer--;
  }

  updateProjectileAttack(enemies) {
    let targetInvalid =
      !this.target ||
      this.target.isDead() ||
      this.target.reachedEnd() ||
      !this.isInRange(this.target);

    if (targetInvalid) {
      this.target = null;
      let closestDist = Infinity;
      for (let enemy of enemies) {
        if (enemy.isDead() || enemy.reachedEnd()) continue;
        let d = this.getDistanceTo(enemy);
        if (d <= this.range && d < closestDist) {
          closestDist = d;
          this.target = enemy;
        }
      }
    }

    if (this.target && this.fireTimer <= 0) {
      this.projectiles.push({
        x: this.x,
        y: this.y,
        targetEnemy: this.target,
        speed: 5,
        alive: true
      });
      this.fireTimer = this.fireRate;
    }

    for (let proj of this.projectiles) {
      if (!proj.alive) continue;
      if (proj.targetEnemy.isDead() || proj.targetEnemy.reachedEnd()) {
        proj.alive = false;
        continue;
      }

      let dx = proj.targetEnemy.x - proj.x;
      let dy = proj.targetEnemy.y - proj.y;
      let d  = Math.sqrt(dx * dx + dy * dy);

      if (d < proj.speed) {
        proj.targetEnemy.takeDamage(this.damage);
        if (this.type === 'slow') {
          proj.targetEnemy.applySlow(this.slowEffect, this.slowDuration);
        }
        proj.alive = false;
      } else {
        proj.x += (dx / d) * proj.speed;
        proj.y += (dy / d) * proj.speed;
      }
    }
    this.projectiles = this.projectiles.filter(p => p.alive);
  }

  updateAreaAttack(enemies) {
    this.target = null;
    this.projectiles = [];
    if (this.fireTimer > 0) return;

    let targets = enemies.filter(enemy =>
      !enemy.isDead() && !enemy.reachedEnd() && this.isInRange(enemy)
    );

    if (targets.length === 0) return;

    for (let enemy of targets) {
      enemy.takeDamage(this.damage);
    }

    this.areaPulseTimer = this.areaPulseDuration;
    this.fireTimer = this.fireRate;
  }

  // ----------------------------------------
  // draw() — called every frame by GameManager (before enemies)
  // ----------------------------------------
  draw() {
    push();
    let [cr, cg, cb] = this.color;

    if (this.target || this.type === 'area') {
      fill(cr, cg, cb, 22);
      stroke(cr, cg, cb, 90);
    } else {
      fill(cr, cg, cb, 10);
      stroke(cr, cg, cb, 45);
    }
    strokeWeight(this.type === 'area' ? 2 : 1);
    ellipse(this.x, this.y, this.range * 2, this.range * 2);

    // Extra outer ring for Area Tower so its larger range stands out clearly.
    if (this.type === 'area') {
      noFill();
      stroke(cr, cg, cb, 40);
      strokeWeight(1);
      ellipse(this.x, this.y, (this.range + 10) * 2, (this.range + 10) * 2);
    }

    this.drawTowerBody();
    this.drawAttackEffects();
    this.drawProjectiles();

    pop();
  }

  drawTowerBody() {
    let [cr, cg, cb] = this.color;
    noStroke();
    fill(28, 28, 40, 210);
    ellipse(this.x, this.y, this.size + 10, this.size + 10);
    fill(cr, cg, cb);
    ellipse(this.x, this.y, this.size, this.size);

    if (this.type === 'basic') {
      rectMode(CENTER);
      fill(Math.max(0, cr - 15), Math.max(0, cg - 15), Math.max(0, cb - 15));
      rect(this.x, this.y - this.size / 2 - 7, 10, 16, 3);
    } else if (this.type === 'slow') {
      stroke(220, 250, 255);
      strokeWeight(2);
      line(this.x - 7, this.y, this.x + 7, this.y);
      line(this.x, this.y - 7, this.x, this.y + 7);
      line(this.x - 5, this.y - 5, this.x + 5, this.y + 5);
    } else if (this.type === 'area') {
      stroke(255, 200, 120);
      strokeWeight(2);
      for (let i = 0; i < 8; i++) {
        let angle = (TWO_PI / 8) * i;
        let inner = this.size * 0.35;
        let outer = this.size * 0.7;
        line(
          this.x + Math.cos(angle) * inner,
          this.y + Math.sin(angle) * inner,
          this.x + Math.cos(angle) * outer,
          this.y + Math.sin(angle) * outer
        );
      }
    }
  }

  drawAttackEffects() {
    if (this.target && this.type !== 'area') {
      stroke(255, 255, 80, 50);
      strokeWeight(1);
      line(this.x, this.y, this.target.x, this.target.y);
    }

    if (this.type === 'area' && this.areaPulseTimer > 0) {
      let t = 1 - (this.areaPulseTimer / this.areaPulseDuration);
      let radius = this.range * t;
      noFill();
      stroke(255, 170, 90, 180 * (1 - t));
      strokeWeight(3);
      ellipse(this.x, this.y, radius * 2, radius * 2);
    }
  }

  drawProjectiles() {
    let [br, bg, bb] = this.bulletColor;
    noStroke();
    fill(br, bg, bb);
    for (let proj of this.projectiles) {
      ellipse(proj.x, proj.y, 6, 6);
    }
  }
}
