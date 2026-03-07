// ========================================
// Tower — Tower behaviour (stub for teammate)
// ========================================

class Tower {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.range = 120;    
    this.damage = 10;    
    this.level = 1; 
  }

  update(enemies) {}

  draw() {
    // TODO: 塔系统同学替换为精美图形

    // 攻击范围圈（半透明蓝色）
    fill(100, 150, 255, 30);
    stroke(100, 150, 255, 80);
    strokeWeight(1);
    ellipse(this.x, this.y, this.range * 2, this.range * 2);

    // 塔底座（深灰色方块）
    noStroke();
    fill(60, 60, 80);
    rectMode(CENTER);
    rect(this.x, this.y, GRID_SIZE - 8, GRID_SIZE - 8, 5);

    // 塔炮管（蓝色）
    fill(50, 120, 220);
    rect(this.x, this.y - 8, 14, 22, 3);

    // 等级标记
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(11);
    text("Lv1", this.x, this.y + 14);

    rectMode(CORNER);
    }
}
