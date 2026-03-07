// ========================================
// Enemy — Enemy behaviour (stub for teammate)
// ========================================

class Enemy {
  constructor() {
    this.hp = 100;
    this.reward = 10;
  }

  update() {}

  draw() {}

  isDead() {
    return this.hp <= 0;
  }

  reachedEnd() {
    return false;
  }
}
