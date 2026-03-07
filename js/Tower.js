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

    this.bulletSpeed = stats.bulletSpeed || 5;  // per-type bullet speed from config
    this.fireTimer = 0;
    this.target = null;
    this.projectiles = [];
    this.areaPulseTimer = 0;
    // areaPulseDuration from config (area tower uses 9 = 2× faster than default 18)
    this.areaPulseDuration = stats.areaPulseDuration || 18;

    this.isFiring = false;
    this.fireAnimTimer = 0;
    this.fireAnimDuration = 10;

    // Hit-effect particles: { x, y, timer, maxTimer, type, maxRadius? }
    this.hitEffects = [];
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

    if (this.fireAnimTimer > 0) {
      this.fireAnimTimer--;
      if (this.fireAnimTimer <= 0) this.isFiring = false;
    }

    // Tick hit effects down and cull expired ones
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      this.hitEffects[i].timer--;
      if (this.hitEffects[i].timer <= 0) this.hitEffects.splice(i, 1);
    }
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
        speed: this.bulletSpeed,  // uses per-tower speed from TOWER_TYPES config
        alive: true,
        trail: []                 // recent positions for the visual trail
      });
      this.fireTimer = this.fireRate;
      this.isFiring = true;
      this.fireAnimTimer = this.fireAnimDuration;
    }

    for (let proj of this.projectiles) {
      if (!proj.alive) continue;

      // Record trail position before moving
      proj.trail.push({ x: proj.x, y: proj.y });
      if (proj.trail.length > 5) proj.trail.shift();

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
        // Spawn a hit flash at impact position
        let maxT = this.type === 'slow' ? 8 : 5;
        this.hitEffects.push({
          x: proj.x, y: proj.y,
          timer: maxT, maxTimer: maxT,
          type: this.type
        });
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

    // Spawn expanding AOE explosion effect
    this.hitEffects.push({
      x: this.x, y: this.y,
      timer: 15, maxTimer: 15,
      type: 'area',
      maxRadius: this.splashRadius
    });

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
    this.drawHitEffects();

    pop();
  }

  drawTowerBody() {
    const SPRITE_SIZE = (typeof GRID_SIZE !== 'undefined' ? GRID_SIZE : 60) - 2;
    let imgs = (typeof gameImages !== 'undefined') ? gameImages : {};
    let img = null;

    if (this.type === 'basic') {
      img = this.isFiring ? imgs.towerBasicFire : imgs.towerBasic;
    } else if (this.type === 'slow') {
      img = this.target ? imgs.towerSlowActive : imgs.towerSlow;
    } else if (this.type === 'area') {
      img = imgs.towerAreaFire;
    }

    if (img && img.width > 0) {
      imageMode(CENTER);
      image(img, this.x, this.y, SPRITE_SIZE, SPRITE_SIZE);
    } else {
      // Fallback: coloured shapes
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
    for (let proj of this.projectiles) {
      // ── Trail (drawn first so it renders behind the bullet) ──────
      let trailLen = proj.trail.length;
      for (let t = 0; t < trailLen; t++) {
        let tp = proj.trail[t];
        let frac = (t + 1) / (trailLen + 1);  // 0→1 as we approach the bullet

        if (this.type === 'basic') {
          noStroke();
          fill(255, 140, 0, frac * 140);
          ellipse(tp.x, tp.y, 12 * frac * 0.65, 12 * frac * 0.65);
        } else if (this.type === 'slow') {
          noStroke();
          fill(180, 225, 255, frac * 140);
          ellipse(tp.x, tp.y, 12 * frac * 0.65, 12 * frac * 0.65);
        } else if (this.type === 'area') {
          // flame gradient: orange near bullet, red at tail
          let r = lerp(200, 255, frac);
          let g = lerp(30, 100, frac);
          noStroke();
          fill(r, g, 0, frac * 160);
          ellipse(tp.x, tp.y, 16 * frac * 0.7, 16 * frac * 0.7);
        }
      }

      // ── Main bullet ──────────────────────────────────────────────
      if (this.type === 'basic') {
        stroke(204, 136, 0);
        strokeWeight(2);
        fill(255, 215, 0);
        ellipse(proj.x, proj.y, 12, 12);
      } else if (this.type === 'slow') {
        stroke(255, 255, 255);
        strokeWeight(2);
        fill(102, 204, 255);
        ellipse(proj.x, proj.y, 12, 12);
        // Orbiting snow particles (visual only — no collision change)
        noStroke();
        fill(255, 255, 255, 200);
        let t = frameCount * 0.12;
        for (let i = 0; i < 3; i++) {
          let angle = t + (i * TWO_PI / 3);
          ellipse(proj.x + cos(angle) * 8, proj.y + sin(angle) * 8, 3, 3);
        }
      } else if (this.type === 'area') {
        stroke(204, 51, 0);
        strokeWeight(2);
        fill(255, 102, 51);
        ellipse(proj.x, proj.y, 16, 16);
      }
    }
    noStroke();
  }

  drawHitEffects() {
    for (let fx of this.hitEffects) {
      let progress = 1 - fx.timer / fx.maxTimer;  // 0 at start → 1 at end
      let alpha    = (fx.timer / fx.maxTimer) * 255;

      if (fx.type === 'basic') {
        let r = 20 * progress;
        noStroke();
        fill(255, 255, 255, alpha);
        ellipse(fx.x, fx.y, r * 2, r * 2);
      } else if (fx.type === 'slow') {
        let r = 25 * progress;
        noStroke();
        fill(102, 204, 255, alpha * 0.85);
        ellipse(fx.x, fx.y, r * 2, r * 2);
      } else if (fx.type === 'area') {
        let maxR = fx.maxRadius || 120;
        let r    = maxR * progress;
        // Filled core (semi-transparent)
        noStroke();
        fill(255, 80, 0, alpha * 0.25);
        ellipse(fx.x, fx.y, r * 2, r * 2);
        // Expanding ring
        noFill();
        stroke(255, 100 + 80 * (1 - progress), 0, alpha);
        strokeWeight(3);
        ellipse(fx.x, fx.y, r * 2, r * 2);
        noStroke();
      }
    }
  }
}
