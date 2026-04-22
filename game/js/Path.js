// Path — Enemy movement path

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
      rect(wp.x, wp.y, CURRENT_GRID_SIZE, CURRENT_GRID_SIZE);
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

// Level waypoint definitions (1920x900 design; alignment uses applyLevelGridConfig + CURRENT_GRID_SIZE)

//Level 1 — Big Ben
// Path.js
function getLevel1Waypoints() {
 return [
  { x: 28, y: 374 },  // Entry
{ x: 208, y: 374 },  // Waypoint 1
{ x: 208, y: 134 },  // Waypoint 2
{ x: 508, y: 134 },  // Waypoint 3
{ x: 508, y: 614 },  // Waypoint 4
{ x: 808, y: 614 },  // Waypoint 5
{ x: 808, y: 374 },  // Waypoint 6
{ x: 1528, y: 374 },  // Waypoint 7
{ x: 1708, y: 374 },  // Waypoint 8
{ x: 1828, y: 314 },  // Exit
  ];
}


function getLevel2Waypoints() { 
return [
{ x: 795, y: 885 },  // Entry (GameManager.js, line 372)
{ x: 465, y: 735 },  // Waypoint 1 (GameManager.js, line 372)
{ x: 225, y: 555 },  // Waypoint 2 (GameManager.js, line 372)
{ x: 165, y: 435 },  // Waypoint 3 (GameManager.js, line 372)
{ x: 195, y: 315 },  // Waypoint 4 (GameManager.js, line 372)
{ x: 255, y: 255 },  // Waypoint 5 (GameManager.js, line 372)
{ x: 345, y: 195 },  // Waypoint 6 (GameManager.js, line 372)
{ x: 495, y: 195 },  // Waypoint 7 (GameManager.js, line 372)
{ x: 615, y: 225 },  // Waypoint 8 (GameManager.js, line 372)
{ x: 735, y: 315 },  // Waypoint 9 (GameManager.js, line 372)
{ x: 855, y: 375 },  // Waypoint 10 (GameManager.js, line 372)
{ x: 975, y: 405 },  // Waypoint 11 (GameManager.js, line 372)
{ x: 1635, y: 405 },  // Exit (GameManager.js, line 372)
];
} 


function getLevel3Waypoints() {
  return [
    { x: 30, y: 450 },     // Entry
    { x: 210, y: 450 },    // Right
    { x: 210, y: 390 },    // Up
    { x: 330, y: 270 },    // Diagonal up
    { x: 450, y: 270 },    // Right
    { x: 510, y: 330 },    // Down
    { x: 510, y: 690 },    // Down
    { x: 570, y: 750 },    // Diagonal down
    { x: 810, y: 750 },    // Right
    { x: 810, y: 510 },    // Up
    { x: 750, y: 450 },    // Left
    { x: 750, y: 270 },    // Up
    { x: 1050, y: 270 },   // Right
    { x: 1050, y: 690 },   // Down
    { x: 1110, y: 750 },   // Diagonal down
    { x: 1290, y: 750 },   // Right
    { x: 1350, y: 690 },   // Up
    { x: 1350, y: 570 },   // Up
    { x: 1650, y: 270 }    // Exit
  ];
}
