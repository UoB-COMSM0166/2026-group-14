// Landmark - Protected objective building

class Landmark {
  /**
   * @param {string} name - Landmark name (e.g. "Big Ben")
   * @param {number} maxHp - Max HP
   * @param {number} x - X coordinate on canvas
   * @param {number} y - Y coordinate on canvas
   * @param {SoundManager} sound - Sound manager instance
   */
  constructor(name, maxHp, x, y, sound = null) {
    this.name = name;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.x = x;
    this.y = y;
    this.sound = sound;
  }

  /**
   * Landmark takes damage
   * @param {number} amount - Damage amount
   */
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
    this.sound.play("destruction");
    console.log(`[Combat] ${this.name} took ${amount} damage. HP: ${this.hp}/${this.maxHp}`);
  }

  /**
   * Check if landmark is destroyed
   * @returns {boolean}
   */
  isDestroyed() {
    return this.hp <= 0;
  }

  /**
   * Get current HP as fraction (0-1) for bar display
   * @returns {number}
   */
  getHpPercent() {
    return this.hp / this.maxHp;
  }


  draw() {
    push();

    const BAR_W = 90;   // bar width in pixels
    const BAR_H = 8;    // bar height in pixels
    const BAR_OFFSET_Y = 100;  // how many pixels above this.y to place bar

    let hpPercent = this.getHpPercent();
    let barX = this.x - BAR_W / 2;
    let barY = this.y - BAR_OFFSET_Y;

    // Background track
    noStroke();
    fill(30, 30, 30, 210);
    rect(barX, barY, BAR_W, BAR_H, 3);

    // Coloured fill: green → yellow → red
    if (hpPercent > 0.6) fill(50, 210, 50);
    else if (hpPercent > 0.3) fill(240, 200, 0);
    else fill(230, 50, 50);
    rect(barX, barY, BAR_W * hpPercent, BAR_H, 3);

    // Thin white border so bar stands out against any background colour
    noFill();
    stroke(255, 255, 255, 120);
    strokeWeight(1);
    rect(barX, barY, BAR_W, BAR_H, 3);

    pop();
  }

  /**
   * Reset HP (when restarting level)
   */
  reset() {
    this.hp = this.maxHp;
  }
}
