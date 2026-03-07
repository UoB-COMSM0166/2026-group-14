// ========================================
// Enemy — Path-following enemy unit
// ========================================

class Enemy {
  /**
   * @param {Path}   path   - The path this enemy will follow
   * @param {Object} config - { type, hp, speed }
   *                          Any missing field falls back to ENEMY_STATS preset.
   */
  constructor(path, config = {}) {
    this.path = path;

    // Resolve type (default: 'basic')
    let type   = config.type || 'basic';
    let preset = ENEMY_STATS[type] || ENEMY_STATS.basic;

    this.type   = type;
    this.maxHp  = (config.hp    !== undefined) ? config.hp    : preset.hp;
    this.hp     = this.maxHp;
    this.speed  = (config.speed !== undefined) ? config.speed : preset.speed;
    this.baseSpeed = this.speed;
    this.reward = preset.reward;
    this.slowTimer = 0;
    this.isSlowed = false;

    // Visual body diameter varies by type
    const SIZES = { basic: 20, fast: 16, tank: 28, boss: 34 };
    this.bodySize = SIZES[type] || 20;

    // --- Position: start at the first waypoint ---
    let start = path.getWaypoint(0);
    this.x = start.x;
    this.y = start.y;

    // --- Path following state ---
    this.currentWaypointIndex = 1; // index of the NEXT target waypoint

    // --- Status flags ---
    this._alive      = true;
    this._reachedEnd = false;
  }

  // ----------------------------------------
  // update() — called every frame by GameManager
  // ----------------------------------------
  update() {
    if (!this._alive || this._reachedEnd) return;

    if (this.slowTimer > 0) {
      this.slowTimer--;
      if (this.slowTimer <= 0) {
        this.speed = this.baseSpeed;
        this.isSlowed = false;
      }
    }

    // All waypoints visited → enemy reached the landmark
    if (this.currentWaypointIndex >= this.path.count()) {
      this._reachedEnd = true;
      return;
    }

    let target = this.path.getWaypoint(this.currentWaypointIndex);
    let dx = target.x - this.x;
    let dy = target.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.speed) {
      // Snap to waypoint and advance to the next one
      this.x = target.x;
      this.y = target.y;
      this.currentWaypointIndex++;

      if (this.currentWaypointIndex >= this.path.count()) {
        this._reachedEnd = true;
      }
    } else {
      // Move towards target
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
  }

  // ----------------------------------------
  // draw() — called every frame by GameManager
  // ----------------------------------------
  draw() {
    push();

    // --- Determine sprite image and display size by type ---
    let imgs = (typeof gameImages !== 'undefined') ? gameImages : {};
    let spriteMap = {
      basic: { img: imgs.enemyGuard,    w: 70, h: 90 },
      fast:  { img: imgs.enemyPigeon,   w: 60, h: 60 },
      tank:  { img: imgs.enemyHedgehog, w: 80, h: 80 }
    };
    let entry = spriteMap[this.type] || spriteMap.basic;
    let useSprite = entry.img && entry.img.width > 0;

    // --- Calculate movement direction for flipping ---
    let movingLeft = false;
    if (this.currentWaypointIndex < this.path.count()) {
      let target = this.path.getWaypoint(this.currentWaypointIndex);
      movingLeft = (target.x - this.x) < 0;
    }

    // --- Slow glow ring (drawn below sprite) ---
    if (this.isSlowed) {
      noStroke();
      fill(130, 210, 255, 90);
      let glowR = useSprite ? Math.max(entry.w, entry.h) / 2 + 8 : this.bodySize / 2 + 6;
      ellipse(this.x, this.y, glowR * 2, glowR * 2);
    }

    // --- Sprite or fallback shape ---
    if (useSprite) {
      imageMode(CENTER);
      if (movingLeft) {
        translate(this.x, this.y);
        scale(-1, 1);
        image(entry.img, 0, 0, entry.w, entry.h);
      } else {
        image(entry.img, this.x, this.y, entry.w, entry.h);
      }
    } else {
      noStroke();
      let bodyColor = this._bodyColor();
      fill(bodyColor.r, bodyColor.g, bodyColor.b);
      ellipse(this.x, this.y, this.bodySize, this.bodySize);
      stroke(0, 0, 0, 120);
      strokeWeight(1.5);
      noFill();
      ellipse(this.x, this.y, this.bodySize, this.bodySize);
    }

    // --- HP bar (always drawn above, uses sprite height when available) ---
    let halfH = useSprite ? entry.h / 2 : this.bodySize / 2;
    let barW  = useSprite ? Math.max(entry.w, 30) : this.bodySize + 10;
    let barH  = 5;
    let barX  = this.x - barW / 2;
    let barY  = this.y - halfH - 8;
    let ratio = this.hp / this.maxHp;

    noStroke();
    fill(50, 50, 50, 180);
    rect(barX, barY, barW, barH, 2);

    if (ratio > 0.6)      fill(50, 210, 50);
    else if (ratio > 0.3) fill(240, 200, 0);
    else                  fill(230, 50, 50);
    rect(barX, barY, barW * ratio, barH, 2);

    pop();
  }

  // ----------------------------------------
  // takeDamage() — called by Tower
  // ----------------------------------------
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp     = 0;
      this._alive = false;
    }
  }

  // ----------------------------------------
  // Status queries — called by GameManager.update()
  // ----------------------------------------
  isDead() {
    return !this._alive;
  }

  reachedEnd() {
    return this._reachedEnd;
  }

  applySlow(slowEffect, duration) {
    if (this.isSlowed || this._reachedEnd || !this._alive) return;
    this.speed = this.baseSpeed * slowEffect;
    this.slowTimer = duration;
    this.isSlowed = true;
  }

  // ----------------------------------------
  // Internal helpers
  // ----------------------------------------
  _bodyColor() {
    switch (this.type) {
      case 'fast': return { r: 255, g: 140, b: 0  }; // orange
      case 'tank': return { r: 80,  g: 80,  b: 180 }; // blue-purple
      case 'boss': return { r: 140, g: 0,   b: 200 }; // purple
      default:     return { r: 210, g: 50,  b: 50  }; // basic: red
    }
  }
}
