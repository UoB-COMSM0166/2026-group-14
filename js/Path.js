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
// Each path snakes from the left edge to the landmark.
// All coordinates are grid-aligned (GRID_SIZE = 60).
// Y values stay below the 50px HUD (i.e. >= GRID_SIZE).
// ========================================

/**
 * Level 1 — Big Ben (landmark at CANVAS_WIDTH-100, CANVAS_HEIGHT/2)
 * Snake pattern: right → up → right → down → right → up → arrive
 */
function getLevel1Waypoints() {
  return [
    { x: GRID_SIZE / 2,                  y: CANVAS_HEIGHT / 2           }, // entry (left edge)
    { x: GRID_SIZE * 4,                  y: CANVAS_HEIGHT / 2           }, // →
    { x: GRID_SIZE * 4,                  y: GRID_SIZE * 2               }, // ↑  (y=120, below HUD)
    { x: GRID_SIZE * 9,                  y: GRID_SIZE * 2               }, // →
    { x: GRID_SIZE * 9,                  y: CANVAS_HEIGHT - GRID_SIZE * 2 }, // ↓
    { x: GRID_SIZE * 14,                 y: CANVAS_HEIGHT - GRID_SIZE * 2 }, // →
    { x: GRID_SIZE * 14,                 y: CANVAS_HEIGHT / 2           }, // ↑
    { x: CANVAS_WIDTH - 100,             y: CANVAS_HEIGHT / 2           }  // arrive at Big Ben
  ];
}

/**
 * Level 2 — Tower Bridge (placeholder, same shape but offset)
 */
function getLevel2Waypoints() {
  return [
    { x: GRID_SIZE / 2,    y: CANVAS_HEIGHT / 3           },
    { x: GRID_SIZE * 5,    y: CANVAS_HEIGHT / 3           },
    { x: GRID_SIZE * 5,    y: CANVAS_HEIGHT * 2 / 3       },
    { x: GRID_SIZE * 10,   y: CANVAS_HEIGHT * 2 / 3       },
    { x: GRID_SIZE * 10,   y: CANVAS_HEIGHT / 3           },
    { x: GRID_SIZE * 15,   y: CANVAS_HEIGHT / 3           },
    { x: GRID_SIZE * 15,   y: CANVAS_HEIGHT / 2           },
    { x: CANVAS_WIDTH - 100, y: CANVAS_HEIGHT / 2         }
  ];
}

/**
 * Level 3 — Buckingham Palace (placeholder)
 */
function getLevel3Waypoints() {
  return getLevel1Waypoints(); // replaced when Level 3 is fully designed
}
