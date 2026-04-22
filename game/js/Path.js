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
// Based on CURRENT_GRID_SIZE cell centres (export uses live offset/size)
return [
    { x: 15, y: 420 },  // Entry
    { x: 255, y: 420 },  // Waypoint 1
    { x: 255, y: 180 },  // Waypoint 2
    { x: 555, y: 180 },  // Waypoint 3
    { x: 555, y: 660 },  // Waypoint 4
    { x: 855, y: 660 },  // Waypoint 5
    { x: 855, y: 450 },  // Waypoint 6
    { x: 855, y: 420 },  // Waypoint 7
    { x: 1785, y: 420 },  // Exit
  ];
}

function getLevel2Waypoints() { 
return [
{ x: 555, y: 765 },  // Entry
{ x: 315, y: 645 },  // Waypoint 1
{ x: 225, y: 555 },  // Waypoint 2
{ x: 165, y: 465 },  // Waypoint 3
{ x: 165, y: 375 },  // Waypoint 4
{ x: 195, y: 315 },  // Waypoint 5
{ x: 255, y: 255 },  // Waypoint 6
{ x: 315, y: 225 },  // Waypoint 7
{ x: 405, y: 195 },  // Waypoint 8
{ x: 495, y: 195 },  // Waypoint 9
{ x: 585, y: 225 },  // Waypoint 10
{ x: 645, y: 255 },  // Waypoint 11
{ x: 705, y: 285 },  // Waypoint 12
{ x: 765, y: 345 },  // Waypoint 13
{ x: 825, y: 375 },  // Waypoint 14
{ x: 915, y: 405 },  // Waypoint 15
{ x: 1095, y: 405 },  // Waypoint 16
{ x: 1275, y: 405 },  // Waypoint 17
{ x: 1665, y: 405 },  // Waypoint 18
{ x: 1725, y: 405 },  // Exit
];
} 


function getLevel3Waypoints() {
  return [
    { x: 15, y: 435 },  // Entry
    { x: 225, y: 435 },  // Waypoint 1
    { x: 255, y: 315 },  // Waypoint 2
    { x: 285, y: 285 },  // Waypoint 3
    { x: 375, y: 255 },  // Waypoint 4
    { x: 495, y: 285 },  // Waypoint 5
    { x: 525, y: 375 },  // Waypoint 6
    { x: 525, y: 645 },  // Waypoint 7
    { x: 825, y: 645 },  // Waypoint 8
    { x: 825, y: 495 },  // Waypoint 9
    { x: 735, y: 435 },  // Waypoint 10
    { x: 735, y: 255 },  // Waypoint 11
    { x: 1065, y: 255 },  // Waypoint 12
    { x: 1065, y: 645 },  // Waypoint 13
    { x: 1305, y: 645 },  // Waypoint 14
    { x: 1335, y: 555 },  // Waypoint 15
    { x: 1395, y: 495 },  // Waypoint 16
    { x: 1485, y: 405 },  // Waypoint 17
    { x: 1575, y: 315 },  // Exit
  ];
}
