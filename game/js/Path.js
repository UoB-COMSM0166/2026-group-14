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
function getLevel1Waypoints() {
  return [
    { x: 30,   y: 463 },   // Entry
    { x: 240,  y: 463 },   // → col 4
    { x: 240,  y: 123 },   // ↑ row 2
    { x: 540,  y: 123 },   // → col 9
    { x: 540,  y: 803 },   // ↓ row 13
    { x: 840,  y: 803 },   // → col 14
    { x: 840,  y: 463 },   // ↑ row 8
    { x: 1820, y: 463 }    // Exit (Big Ben)
  ];
}


function getLevel2Waypoints() {
  return [
    { x: 450, y: 870 },  


    { x: 390, y: 810 },
    { x: 330, y: 750 },
    { x: 270, y: 690 },
    { x: 240, y: 630 },
    { x: 210, y: 570 },
    { x: 180, y: 510 },
    { x: 180, y: 450 },


    { x: 180, y: 390 },
    { x: 210, y: 330 },
    { x: 270, y: 270 },
    { x: 330, y: 210 },
    { x: 420, y: 180 },
    { x: 510, y: 180 },


    { x: 600, y: 210 },
    { x: 690, y: 270 },
    { x: 780, y: 330 },
    { x: 900, y: 360 },

 
    { x: 1020, y: 375 },
    { x: 1140, y: 375 },
    { x: 1260, y: 375 },
    { x: 1380, y: 375 },
    { x: 1500, y: 375 },
    { x: 1620, y: 375 },
    { x: 1710, y: 390 },
    { x: 1770, y: 405 },


    { x: 1830, y: 420 },
    { x: 1890, y: 420 }
  ];
}

//Level 3 - Tower of London Siege

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
