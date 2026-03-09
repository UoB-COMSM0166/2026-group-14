// Landmark: protected objective building logic (to be implemented).
// ========================================
// 🏰 Landmark — 英国地标建筑（被保护的目标）
// 怪物走到终点就会攻击地标，血量归零则游戏失败
// ========================================

class Landmark {
    /**
     * 创建一个地标
     * @param {string} name - 地标名称（如 "Big Ben"）
     * @param {number} maxHp - 最大血量
     * @param {number} x - 在画布上的 x 坐标
     * @param {number} y - 在画布上的 y 坐标
     */
    constructor(name, maxHp, x, y) {
      this.name = name;
      this.maxHp = maxHp;
      this.hp = maxHp;      // 当前血量 = 满血
      this.x = x;
      this.y = y;
    }
  
    /**
     * 地标受到伤害
     * @param {number} amount - 伤害值
     * 
     * 就像城墙被撞了一下，裂了一点
     */
    takeDamage(amount) {
      this.hp -= amount;
      if (this.hp < 0) this.hp = 0;  // 血量不能低于0
      console.log(`🏰 ${this.name} 受到 ${amount} 点伤害！剩余血量：${this.hp}/${this.maxHp}`);
    }
  
    /**
     * 地标是否被摧毁
     * @returns {boolean} true = 被摧毁了（游戏失败）
     * 
     * 就像检查城墙还在不在
     */
    isDestroyed() {
      return this.hp <= 0;
    }
  
    /**
     * 获取当前血量百分比（给血条显示用）
     * @returns {number} 0 到 1 之间的小数
     */
    getHpPercent() {
      return this.hp / this.maxHp;
    }
  
    /**
     * Draw only the HP bar above Big Ben's location in the background image.
     * The Big Ben sprite itself is already part of map_bg_level1.png — we do
     * NOT draw bigben.png on top of it to avoid double-rendering.
     *
     * HP bar position: centred on this.x, placed ~100 px above this.y so that
     * the bar sits near the top of the tower in the background artwork.
     * Adjust the BAR_OFFSET_Y value if the bar doesn't line up with the image.
     */
    draw() {
      push();

      const BAR_W         = 90;   // bar width in pixels
      const BAR_H         = 8;    // bar height in pixels
      const BAR_OFFSET_Y  = 100;  // how many pixels above this.y to place bar

      let hpPercent = this.getHpPercent();
      let barX = this.x - BAR_W / 2;
      let barY = this.y - BAR_OFFSET_Y;

      // Background track
      noStroke();
      fill(30, 30, 30, 210);
      rect(barX, barY, BAR_W, BAR_H, 3);

      // Coloured fill: green → yellow → red
      if (hpPercent > 0.6)      fill(50, 210, 50);
      else if (hpPercent > 0.3) fill(240, 200, 0);
      else                      fill(230, 50, 50);
      rect(barX, barY, BAR_W * hpPercent, BAR_H, 3);

      // Thin white border so bar stands out against any background colour
      noFill();
      stroke(255, 255, 255, 120);
      strokeWeight(1);
      rect(barX, barY, BAR_W, BAR_H, 3);

      pop();
    }
  
    /**
     * 重置血量（重新开始关卡时用）
     */
    reset() {
      this.hp = this.maxHp;
    }
  }
  