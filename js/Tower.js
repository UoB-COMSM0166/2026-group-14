// ========================================
// Tower — Placement, targeting, and firing
// ========================================

class Tower {

  // Per-type stat presets (range px, damage per hit, fireRate in frames)
  static get STATS() {
    return {
      basic: { range: 100, damage: 25, fireRate: 60 }, // 1 shot/sec
      slow:  { range: 120, damage: 10, fireRate: 45 }, // faster but weaker
      area:  { range: 150, damage: 15, fireRate: 90 }  // slow, hits hard
    };
  }

  constructor(x, y, type) {
    this.x    = x;
    this.y    = y;
    this.type = type;
    this.level = 1;

    // Load stats for this type (fall back to basic if unknown)
    let stats     = Tower.STATS[type] || Tower.STATS.basic;
    this.range    = stats.range;
    this.damage   = stats.damage;
    this.fireRate = stats.fireRate;

    // Runtime state
    this.fireTimer   = 0;    // counts down; fires when it reaches 0
    this.target      = null; // currently locked enemy
    this.projectiles = [];   // active in-flight projectiles
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

    // ── Step 1: Validate / find target ──────────────────────────────────
    let targetInvalid =
      !this.target ||
      this.target.isDead() ||
      this.target.reachedEnd() ||
      !this.isInRange(this.target);

    if (targetInvalid) {
      this.target = null;

      // Pick the closest live enemy within range
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

    // ── Step 2: Fire ─────────────────────────────────────────────────────
    if (this.target && this.fireTimer <= 0) {
      this.projectiles.push({
        x:           this.x,
        y:           this.y,
        targetEnemy: this.target,
        speed:       5,
        alive:       true
      });
      this.fireTimer = this.fireRate;
    }

    if (this.fireTimer > 0) this.fireTimer--;

    // ── Step 3: Move projectiles ─────────────────────────────────────────
    for (let proj of this.projectiles) {
      if (!proj.alive) continue;

      // Target died before projectile arrived — discard
      if (proj.targetEnemy.isDead() || proj.targetEnemy.reachedEnd()) {
        proj.alive = false;
        continue;
      }

      let dx = proj.targetEnemy.x - proj.x;
      let dy = proj.targetEnemy.y - proj.y;
      let d  = Math.sqrt(dx * dx + dy * dy);

      if (d < proj.speed) {
        // Hit the enemy
        proj.targetEnemy.takeDamage(this.damage);
        proj.alive = false;
      } else {
        proj.x += (dx / d) * proj.speed;
        proj.y += (dy / d) * proj.speed;
      }
    }

    // Remove spent projectiles
    this.projectiles = this.projectiles.filter(p => p.alive);
  }

  // ----------------------------------------
  // draw() — called every frame by GameManager (before enemies)
  // ----------------------------------------
  draw() {
    push();
    rectMode(CENTER);

    // ── Range circle ──────────────────────────────────────────────────────
    // Brighter when actively targeting, dimmer when idle
    if (this.target) {
      fill(100, 150, 255, 25);
      stroke(100, 150, 255, 90);
    } else {
      fill(100, 150, 255, 8);
      stroke(100, 150, 255, 35);
    }
    strokeWeight(1);
    ellipse(this.x, this.y, this.range * 2, this.range * 2);

    // ── Tower base (dark grey square) ────────────────────────────────────
    noStroke();
    fill(60, 60, 80);
    rect(this.x, this.y, GRID_SIZE - 8, GRID_SIZE - 8, 5);

    // ── Barrel (blue rectangle) ───────────────────────────────────────────
    fill(50, 120, 220);
    rect(this.x, this.y - 8, 14, 22, 3);

    // ── Level label ───────────────────────────────────────────────────────
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(11);
    text("Lv" + this.level, this.x, this.y + 14);

    // ── Debug: thin line to target ────────────────────────────────────────
    if (this.target) {
      stroke(255, 255, 80, 50);
      strokeWeight(1);
      line(this.x, this.y, this.target.x, this.target.y);
    }

    // ── Projectiles (yellow dots, drawn before enemies so they sit below) ─
    noStroke();
    fill(255, 230, 0);
    for (let proj of this.projectiles) {
      ellipse(proj.x, proj.y, 6, 6);
    }

    rectMode(CORNER);
    pop();
  }
}
