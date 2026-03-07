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
     * 在画布上绘制地标和血条
     * 
     * 这里先用简单的图形代替，后面再换成正式美术素材
     */
    draw() {
      push();
      rectMode(CENTER);

      // Building body
      fill(139, 119, 101);
      rect(this.x, this.y, 60, 80);

      // Roof
      fill(178, 34, 34);
      triangle(
        this.x - 40, this.y - 40,
        this.x + 40, this.y - 40,
        this.x, this.y - 80
      );

      // Name label
      fill(255);
      textAlign(CENTER);
      textSize(14);
      text(this.name, this.x, this.y + 60);

      // HP bar background
      fill(100);
      rect(this.x, this.y - 90, 80, 10);

      // HP bar fill (green -> yellow -> red)
      let hpPercent = this.getHpPercent();
      if (hpPercent > 0.6) {
        fill(0, 200, 0);
      } else if (hpPercent > 0.3) {
        fill(255, 200, 0);
      } else {
        fill(255, 0, 0);
      }
      rect(this.x - 40 * (1 - hpPercent), this.y - 90, 80 * hpPercent, 10);

      pop();
    }
  
    /**
     * 重置血量（重新开始关卡时用）
     */
    reset() {
      this.hp = this.maxHp;
    }
  }
  