// Landmark - Protected objective building

class Landmark {
  // name: landmark name (e.g. Big Ben, Tower Bridge, Buckingham Palace)
  // maxHp: landmark max HP
  // x, y: canvas position
  // sound: optional sound manager instance
  constructor(name, maxHp, x, y, sound = null) {
    this.name = name;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.x = x;
    this.y = y;
    this.sound = sound;
  }

  // Apply damage to this landmark.
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
    this.sound.play("destruction");
    console.log(`[Combat] ${this.name} took ${amount} damage. HP: ${this.hp}/${this.maxHp}`);
  }

  // Return true if the landmark is destroyed.
  isDestroyed() {
    return this.hp <= 0;
  }

  // Return HP ratio (0-1) for UI display.
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

  // Reset HP when restarting level.
  reset() {
    this.hp = this.maxHp;
  }
}
