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

    // Crystal Tower (support) properties
    this.isSupport = stats.isSupport || false;
    this.boostRadius = stats.boostRadius || 0;
    this.boostDamage = stats.boostDamage || 0;
    this.boostFireRate = stats.boostFireRate || 0;
    this.isBoosted = false;
    this.boostedDamageMultiplier = 1;
    this.boostedFireRateMultiplier = 1;

    // 禁用状态（哥布林爆破手爆炸）
    this.disabled = false;
    this.disableTimer = 0;
    this.tauntDebuff = 0;
    this.tauntTimer = 0;

    // 蒸汽炮穿透属性
    this.pierceCount = stats.pierceCount || 0;
    this.pierceDamageDecay = stats.pierceDamageDecay || 0;
    this.chargeBonus = stats.chargeBonus || 0;
    this.maxChargeStacks = stats.maxChargeStacks || 0;
    this.chargeStacks = 0;
    this.lastTarget = null;

    // 炼金术士塔药剂效果
    this.potionEffects = stats.potionEffects || null;
  }

  getEffectiveDamage() {
    let dmg = this.damage * this.boostedDamageMultiplier;

    // 嘲讽减益
    if (this.tauntDebuff > 0) {
      dmg = dmg * (1 - this.tauntDebuff);
    }

    // 蓄力加成（蒸汽炮）
    if (this.chargeStacks > 0) {
      dmg = dmg * (1 + this.chargeBonus * this.chargeStacks);
    }

    return dmg;
  }

  getEffectiveFireRate() {
    return Math.max(1, Math.floor(this.fireRate / this.boostedFireRateMultiplier));
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
    if (this.isSupport) return;

    // 更新禁用状态
    if (this.disabled) {
      this.disableTimer--;
      if (this.disableTimer <= 0) {
        this.disabled = false;
      }
      this.target = null;
      this.projectiles = [];
      if (this.fireTimer > 0) this.fireTimer--;
      if (this.areaPulseTimer > 0) this.areaPulseTimer--;
      if (this.fireAnimTimer > 0) this.fireAnimTimer--;
      return;
    }

    // 更新嘲讽debuff
    if (this.tauntTimer > 0) {
      this.tauntTimer--;
      if (this.tauntTimer <= 0) {
        this.tauntDebuff = 0;
      }
    }

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
      this.fireTimer = this.getEffectiveFireRate();
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
        // 蒸汽炮蓄力：连续命中同一目标增加伤害
        if (this.pierceCount > 0) {
          if (proj.targetEnemy === this.lastTarget) {
            this.chargeStacks = Math.min(this.chargeStacks + 1, this.maxChargeStacks);
          } else {
            this.chargeStacks = 0;
          }
          this.lastTarget = proj.targetEnemy;
        }

        let damageApplied = proj.targetEnemy.takeDamage(this.getEffectiveDamage());
        if (damageApplied) {
          if (this.type === 'slow') {
            proj.targetEnemy.applySlow(this.slowEffect, this.slowDuration);
          }
          // 炼金术士塔：随机药剂效果
          if (this.potionEffects && damageApplied) {
            let r = Math.random();
            let acc = 0;
            if ((acc += this.potionEffects.explosion.chance) > r) {
              let splashDmg = this.getEffectiveDamage() * this.potionEffects.explosion.splashDamage;
              for (let e of enemies) {
                if (e.isDead() || e.reachedEnd() || e === proj.targetEnemy) continue;
                if (dist(proj.x, proj.y, e.x, e.y) <= this.potionEffects.explosion.splashRadius) {
                  e.takeDamage(splashDmg);
                }
              }
            } else if ((acc += this.potionEffects.poison.chance) > r) {
              proj.targetEnemy.poisonDamage = (this.potionEffects.poison.damagePercent * proj.targetEnemy.maxHp) / 60;
              proj.targetEnemy.poisonTimer = this.potionEffects.poison.duration;
            } else if ((acc += this.potionEffects.freeze.chance) > r) {
              proj.targetEnemy.applySlow(0.3, this.potionEffects.freeze.duration);
            } else if ((acc += this.potionEffects.weaken.chance) > r) {
              proj.targetEnemy.weakened = true;
              proj.targetEnemy.weakenTimer = this.potionEffects.weaken.duration;
              proj.targetEnemy.weakenBonus = this.potionEffects.weaken.damageBonus;
            }
            // transform 暂不实现
          }
          // 蒸汽炮穿透：命中额外敌人
          if (this.pierceCount > 1 && damageApplied) {
            let hitEnemies = [proj.targetEnemy];
            let pierceRadius = 80;
            let decay = 1 - this.pierceDamageDecay;
            let currentDecay = decay;
            let baseDmg = this.damage * this.boostedDamageMultiplier * (1 - this.tauntDebuff);
            let candidates = enemies.filter(e => !e.isDead() && !e.reachedEnd() && !hitEnemies.includes(e));
            candidates.sort((a, b) => {
              let da = (a.x - proj.x) ** 2 + (a.y - proj.y) ** 2;
              let db = (b.x - proj.x) ** 2 + (b.y - proj.y) ** 2;
              return da - db;
            });
            for (let i = 0; i < this.pierceCount - 1 && i < candidates.length; i++) {
              let e = candidates[i];
              if (dist(proj.x, proj.y, e.x, e.y) <= pierceRadius) {
                e.takeDamage(baseDmg * currentDecay);
                currentDecay *= decay;
                hitEnemies.push(e);
              }
            }
          }
          let maxT = this.type === 'slow' ? 8 : this.type === 'crystal' ? 6 : this.type === 'steam' ? 6 : this.type === 'alchemist' ? 8 : 5;
          this.hitEffects.push({
            x: proj.x, y: proj.y,
            timer: maxT, maxTimer: maxT,
            type: this.type
          });
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
      enemy.takeDamage(this.getEffectiveDamage());
    }

    // Spawn expanding AOE explosion effect
    this.hitEffects.push({
      x: this.x, y: this.y,
      timer: 15, maxTimer: 15,
      type: 'area',
      maxRadius: this.splashRadius
    });

    this.areaPulseTimer = this.areaPulseDuration;
    this.fireTimer = this.getEffectiveFireRate();
  }

  // ----------------------------------------
  // draw() — called every frame by GameManager (before enemies)
  // ----------------------------------------
  draw() {
    push();

    // 只有水晶塔才绘制增益范围光圈
    if (this.type === 'crystal') {
      noFill();
      stroke(150, 100, 255, 80);
      strokeWeight(2);
      ellipse(this.x, this.y, this.boostRadius * 2, this.boostRadius * 2);
      let pulse = sin(frameCount * 0.03) * 15;
      stroke(180, 130, 255, 40);
      strokeWeight(1);
      ellipse(this.x, this.y, this.boostRadius * 2 + pulse, this.boostRadius * 2 + pulse);
    }

    this.drawTowerBody();
    this.drawAttackEffects();
    this.drawProjectiles();
    this.drawHitEffects();

    // 被增益的塔显示小光点特效（非水晶塔）
    if (this.isBoosted && this.type !== 'crystal') {
      fill(200, 150, 255, 150);
      noStroke();
      let sparkleX = this.x + cos(frameCount * 0.1) * 20;
      let sparkleY = this.y - 30 + sin(frameCount * 0.15) * 10;
      ellipse(sparkleX, sparkleY, 6, 6);
      sparkleX = this.x + cos(frameCount * 0.1 + PI) * 20;
      sparkleY = this.y - 25 + sin(frameCount * 0.15 + PI) * 10;
      ellipse(sparkleX, sparkleY, 4, 4);
    }

    pop();
  }

  drawTowerBody() {
    const SPRITE_SIZE = (typeof GRID_SIZE !== 'undefined' ? GRID_SIZE : 60) - 2;
    let imgs = (typeof gameImages !== 'undefined') ? gameImages : {};
    let img = null;
    let isAttacking = this.isFiring || (this.type === 'area' && this.areaPulseTimer > 0) || (this.type === 'slow' && this.target);

    switch (this.type) {
      case 'basic':
        img = isAttacking ? imgs.towerBasicFire : imgs.towerBasic;
        break;
      case 'slow':
        img = this.target ? imgs.towerSlowActive : imgs.towerSlow;
        break;
      case 'area':
        img = isAttacking ? imgs.towerAreaFire : (imgs.towerArea || imgs.towerAreaFire);
        break;
      case 'crystal':
        img = isAttacking ? imgs.towerCrystalActive : imgs.towerCrystal;
        break;
      case 'steam':
        img = isAttacking ? imgs.towerSteamFire : imgs.towerSteam;
        break;
      case 'alchemist':
        img = isAttacking ? imgs.towerAlchemistFire : imgs.towerAlchemist;
        break;
    }

    if (this.disabled) {
      fill(100, 100, 100, 150);
      noStroke();
      for (let i = 0; i < 3; i++) {
        let smokeX = this.x + (Math.random() - 0.5) * 30;
        let smokeY = this.y - 30 - i * 15 - (typeof frameCount !== 'undefined' ? frameCount % 30 : 0);
        let smokeSize = 10 + i * 5;
        ellipse(smokeX, smokeY, smokeSize, smokeSize);
      }
      tint(150, 150, 150, 150);
    }

    if (img && img.width > 0) {
      imageMode(CENTER);
      image(img, this.x, this.y, SPRITE_SIZE, SPRITE_SIZE);
      if (this.disabled) noTint();
    } else {
      if (this.disabled) noTint();
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
      } else if (this.type === 'crystal') {
        stroke(200, 150, 255);
        strokeWeight(2);
        for (let i = 0; i < 6; i++) {
          let angle = (TWO_PI / 6) * i;
          let inner = this.size * 0.3;
          let outer = this.size * 0.8;
          line(
            this.x + Math.cos(angle) * inner,
            this.y + Math.sin(angle) * inner,
            this.x + Math.cos(angle) * outer,
            this.y + Math.sin(angle) * outer
          );
        }
      } else if (this.type === 'steam') {
        stroke(100, 200, 255);
        strokeWeight(2);
        for (let i = 0; i < 4; i++) {
          let angle = (TWO_PI / 4) * i;
          let inner = this.size * 0.4;
          let outer = this.size * 0.85;
          line(
            this.x + Math.cos(angle) * inner,
            this.y + Math.sin(angle) * inner,
            this.x + Math.cos(angle) * outer,
            this.y + Math.sin(angle) * outer
          );
        }
      } else if (this.type === 'alchemist') {
        stroke(100, 255, 100);
        strokeWeight(2);
        for (let i = 0; i < 5; i++) {
          let angle = (TWO_PI / 5) * i;
          let inner = this.size * 0.35;
          let outer = this.size * 0.75;
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
        } else if (this.type === 'crystal') {
          noStroke();
          fill(200, 150, 255, frac * 140);
          ellipse(tp.x, tp.y, 12 * frac * 0.65, 12 * frac * 0.65);
        } else if (this.type === 'steam') {
          noStroke();
          fill(100, 200, 255, frac * 140);
          ellipse(tp.x, tp.y, 14 * frac * 0.65, 14 * frac * 0.65);
        } else if (this.type === 'alchemist') {
          noStroke();
          fill(100, 255, 100, frac * 140);
          ellipse(tp.x, tp.y, 12 * frac * 0.65, 12 * frac * 0.65);
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
      } else if (this.type === 'crystal') {
        stroke(180, 130, 255);
        strokeWeight(2);
        fill(200, 150, 255);
        ellipse(proj.x, proj.y, 12, 12);
      } else if (this.type === 'steam') {
        stroke(100, 200, 255);
        strokeWeight(2);
        fill(150, 220, 255);
        ellipse(proj.x, proj.y, 14, 14);
      } else if (this.type === 'alchemist') {
        stroke(50, 200, 80);
        strokeWeight(2);
        fill(100, 255, 100);
        ellipse(proj.x, proj.y, 12, 12);
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
      } else if (fx.type === 'crystal') {
        let r = 20 * progress;
        noStroke();
        fill(200, 150, 255, alpha);
        ellipse(fx.x, fx.y, r * 2, r * 2);
      } else if (fx.type === 'steam') {
        let r = 22 * progress;
        noStroke();
        fill(100, 200, 255, alpha);
        ellipse(fx.x, fx.y, r * 2, r * 2);
      } else if (fx.type === 'alchemist') {
        let r = 20 * progress;
        noStroke();
        fill(100, 255, 100, alpha);
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
