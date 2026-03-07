// ========================================
// Enemy — Path-following enemy unit
// ========================================

class Enemy {
  /**
   * @param {Path}   path - The path this enemy will follow
   * @param {string} type - One of: 'basic', 'fast', 'tank', 'boss'
   */
  constructor(path, type = 'basic') {
    this.path = path;
    this.type = type;

    // --- Stats (from constants.js ENEMY_STATS) ---
    let stats = ENEMY_STATS[type] || ENEMY_STATS.basic;
    this.maxHp  = stats.hp;
    this.hp     = stats.hp;
    this.speed  = stats.speed;
    this.reward = stats.reward;

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

    // --- Enemy body ---
    noStroke();
    let bodyColor = this._bodyColor();
    fill(bodyColor.r, bodyColor.g, bodyColor.b);
    ellipse(this.x, this.y, 24, 24);

    // --- Outline ---
    stroke(0, 0, 0, 120);
    strokeWeight(1.5);
    noFill();
    ellipse(this.x, this.y, 24, 24);

    // --- HP bar (above the body) ---
    let barW  = 30;
    let barH  = 5;
    let barX  = this.x - barW / 2;
    let barY  = this.y - 20;
    let ratio = this.hp / this.maxHp;

    noStroke();
    fill(50, 50, 50, 180);                          // background
    rect(barX, barY, barW, barH, 2);

    if (ratio > 0.6)      fill(50, 210, 50);        // green
    else if (ratio > 0.3) fill(240, 200, 0);        // yellow
    else                  fill(230, 50, 50);        // red
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
