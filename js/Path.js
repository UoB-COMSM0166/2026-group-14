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
// 所有坐标使用固定像素值（基于 1920×900 设计尺寸）
// 不再使用 CANVAS_WIDTH/CANVAS_HEIGHT 计算！
// ========================================

/**
 * Level 1 — Big Ben
 * 固定坐标，与背景图上的石板路对齐
 * 设计尺寸：1920×926（33列×15行），Y 坐标按 926/960 比例调整
 */
function getLevel1Waypoints() {
  return [
    { x: 30,   y: 463 },   // 入口（左边缘中间）row 8
    { x: 240,  y: 463 },   // → col 4
    { x: 240,  y: 123 },   // ↑ row 2
    { x: 540,  y: 123 },   // → col 9
    { x: 540,  y: 803 },   // ↓ row 13
    { x: 840,  y: 803 },   // → col 14
    { x: 840,  y: 463 },   // ↑ row 8
    { x: 1820, y: 463 }    // 终点（Big Ben 位置）
  ];
}

/**
 * Level 2 — Tower Bridge (placeholder)
 * Y 坐标按 926/960 比例调整
 */
function getLevel2Waypoints() {
  return [
    { x: 30,   y: 309 },
    { x: 300,  y: 309 },
    { x: 300,  y: 618 },
    { x: 600,  y: 618 },
    { x: 600,  y: 309 },
    { x: 900,  y: 309 },
    { x: 900,  y: 463 },
    { x: 1820, y: 463 }
  ];
}

/**
 * Level 3 — Buckingham Palace (placeholder)
 */
function getLevel3Waypoints() {
  return getLevel1Waypoints();
}
