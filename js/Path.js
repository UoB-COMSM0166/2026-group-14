// ========================================
// Path — Enemy movement path
// ========================================

class Path {
  /**
   * @param {Array<{x: number, y: number}>} waypoints - Ordered list of points
   */
  constructor(waypoints) {
    this.waypoints = waypoints.map(wp => createVector(wp.x, wp.y));
  }

  getWaypoint(i) {
    return this.waypoints[i];
  }

  count() {
    return this.waypoints.length;
  }

  // Draw a debug visualisation of the path (called in drawGame before towers)
  draw() {
    push();

    // --- Highlight each path cell ---
    noStroke();
    fill(180, 140, 80, 70);
    for (let wp of this.waypoints) {
      rectMode(CENTER);
      rect(wp.x, wp.y, GRID_SIZE, GRID_SIZE);
    }

    // --- Connecting line ---
    stroke(255, 200, 80, 160);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let wp of this.waypoints) {
      vertex(wp.x, wp.y);
    }
    endShape();

    // --- Start marker (green circle) ---
    noStroke();
    fill(50, 220, 50, 220);
    ellipse(this.waypoints[0].x, this.waypoints[0].y, 18, 18);

    // --- End marker (red circle) ---
    let last = this.waypoints[this.waypoints.length - 1];
    fill(220, 50, 50, 220);
    ellipse(last.x, last.y, 18, 18);

    rectMode(CORNER);
    pop();
  }
}

// ========================================
// Level waypoint definitions
// 基于 1920×900 设计尺寸，GRID_SIZE=60
// ========================================

/**
 * Level 1 — Big Ben
 */
function getLevel1Waypoints() {
  return [
    { x: 30,   y: 463 },   // 入口
    { x: 240,  y: 463 },   // → col 4
    { x: 240,  y: 123 },   // ↑ row 2
    { x: 540,  y: 123 },   // → col 9
    { x: 540,  y: 803 },   // ↓ row 13
    { x: 840,  y: 803 },   // → col 14
    { x: 840,  y: 463 },   // ↑ row 8
    { x: 1820, y: 463 }    // 终点（Big Ben）
  ];
}

/**
 * Level 2 — River Thames Patrol (Tower Bridge)
 * 你设置的路径坐标
 */
function getLevel2Waypoints() {
  return [
    { x: 510, y: 810 },   // 入口
    { x: 450, y: 810 },   // 路径点 1
    { x: 390, y: 750 },   // 路径点 2
    { x: 330, y: 690 },   // 路径点 3
    { x: 330, y: 630 },   // 路径点 4
    { x: 270, y: 570 },   // 路径点 5
    { x: 270, y: 510 },   // 路径点 6
    { x: 270, y: 450 },   // 路径点 7
    { x: 270, y: 390 },   // 路径点 8
    { x: 270, y: 330 },   // 路径点 9
    { x: 330, y: 270 },   // 路径点 10
    { x: 390, y: 210 },   // 路径点 11
    { x: 450, y: 210 },   // 路径点 12
    { x: 510, y: 210 },   // 路径点 13
    { x: 570, y: 270 },   // 路径点 14
    { x: 630, y: 270 },   // 路径点 15
    { x: 630, y: 330 },   // 路径点 16
    { x: 690, y: 390 },   // 路径点 17
    { x: 750, y: 390 },   // 路径点 18
    { x: 810, y: 450 },   // 路径点 19
    { x: 1890, y: 450 }   // 终点（Tower Bridge）
  ];
}

/**
 * Level 3 — Tower of London Siege
 * 基于 GRID_SIZE=60 的格子中心坐标
 */
function getLevel3Waypoints() {
  return [
    { x: 30, y: 450 },     // 入口
    { x: 210, y: 450 },    // 右移
    { x: 210, y: 390 },    // 上拐
    { x: 330, y: 270 },    // 斜上
    { x: 450, y: 270 },    // 右移
    { x: 510, y: 330 },    // 下拐
    { x: 510, y: 690 },    // 向下
    { x: 570, y: 750 },    // 斜下
    { x: 810, y: 750 },    // 右移
    { x: 810, y: 510 },    // 向上
    { x: 750, y: 450 },    // 左拐
    { x: 750, y: 270 },    // 向上
    { x: 1050, y: 270 },   // 右移
    { x: 1050, y: 690 },   // 向下
    { x: 1110, y: 750 },   // 斜下
    { x: 1290, y: 750 },   // 右移
    { x: 1350, y: 690 },   // 上拐
    { x: 1350, y: 570 },   // 向上
    { x: 1650, y: 270 }    // 终点（斜向右上）
  ];
}
