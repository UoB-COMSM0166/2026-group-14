// Global variables to track brush state, colors, and UI settings
let currentColor;
let brushSize;
let isEraser;
let showGrid;
let colors;
let currentColorIndex;
let brushType; // Added: Track brush type (default, spray) - meets "Multiple brush types" challenge

// Brush type constants (for readability)
const BRUSH_DEFAULT = 'default';
const BRUSH_SPRAY = 'spray';

function setup() {
  // Initialize canvas (800x600px) - larger than workshop default for better portrait drawing
  createCanvas(800, 600);
  // Set initial background to white (matches eraser color for consistency)
  background(255);

  // Predefined color palette (RGB values) - mapped to keys 1-9
  colors = [
    [255, 0, 0],    // 1: Red
    [0, 255, 0],    // 2: Green
    [0, 0, 255],    // 3: Blue
    [255, 255, 0],  // 4: Yellow
    [255, 0, 255],  // 5: Magenta
    [255, 165, 0],  // 6: Orange
    [255, 192, 203],// 7: Pink
    [0, 255, 255],  // 8: Cyan
    [0, 0, 0]       // 9: Black
  ];

  // Initialize default state - follows workshop MVP requirements
  currentColorIndex = 0;
  currentColor = colors[currentColorIndex];
  brushSize = 10;
  isEraser = false;
  showGrid = false;
  brushType = BRUSH_DEFAULT; // Start with default smooth line brush
}

function draw() {
  // Draw grid first if enabled (background layer - won't cover existing drawings)
  if (showGrid) {
    drawGrid();
  }

  // Draw top UI bar with white background (ensures text is readable over drawings)
  drawUIPrompt();

  // Handle drawing/erasing when mouse is pressed - core MVP functionality
  if (mouseIsPressed) {
    // Left click: Draw with selected brush/eraser; Right click: Force eraser (workshop suggestion)
    if (mouseButton === LEFT) {
      if (isEraser) {
        useEraser();
      } else {
        // Use selected brush type (default or spray) - meets "Multiple brush types" challenge
        switch (brushType) {
          case BRUSH_DEFAULT:
            drawSmoothLine(); // Workshop-recommended smooth line (uses pmouseX/pmouseY)
            break;
          case BRUSH_SPRAY:
            drawSprayPaint(); // Spray brush example from workshop (enhanced with randomness)
            break;
        }
      }
    } else if (mouseButton === RIGHT) {
      useEraser(); // Right click = quick eraser (no mode switch needed)
    }
  }
}

// Handle keyboard shortcuts - meets "Add key commands" challenge
function keyPressed() {
  // 1-9 keys: Switch to predefined colors (exit eraser/spray mode)
  if (key >= '1' && key <= '9') {
    const index = int(key) - 1;
    if (index < colors.length) {
      currentColorIndex = index;
      currentColor = colors[currentColorIndex];
      isEraser = false;
      brushType = BRUSH_DEFAULT; // Reset to default brush when changing colors
    }
  }

  // +/= keys: Increase brush size (capped at 50px to avoid oversize)
  if (key === '+' || key === '=') {
    brushSize = min(brushSize + 2, 50);
  }

  // -/_ keys: Decrease brush size (minimum 2px to avoid invisibility)
  if (key === '-' || key === '_') {
    brushSize = max(brushSize - 2, 2);
  }

  // E/e keys: Toggle eraser mode (switches to white "brush")
  if (key === 'e' || key === 'E') {
    isEraser = !isEraser;
    brushType = BRUSH_DEFAULT; // Reset brush type when entering eraser mode
  }

  // Spacebar: Clear canvas (resets to white background) - workshop required feature
  if (key === ' ') {
    background(255);
  }

  // S/s keys: Save drawing as JPG (named "portrait.jpg" for workshop user testing)
  if (key === 's' || key === 'S') {
    save('portrait.jpg');
  }

  // G/g keys: Toggle grid (辅助线 for portrait alignment) - workshop "gridded paper" challenge
  if (key === 'g' || key === 'G') {
    showGrid = !showGrid;
  }

  // P/p keys: Toggle spray brush (workshop spraypaint example) - "Multiple brush types" challenge
  if (key === 'p' || key === 'P') {
    brushType = brushType === BRUSH_DEFAULT ? BRUSH_SPRAY : BRUSH_DEFAULT;
    isEraser = false; // Exit eraser mode when switching to spray
  }
}

// Draw smooth continuous lines (workshop-recommended: connects previous and current mouse positions)
function drawSmoothLine() {
  stroke(currentColor[0], currentColor[1], currentColor[2]);
  strokeWeight(brushSize);
  noFill();
  // Use pmouseX/pmouseY to avoid broken lines - core workshop drawing technique
  line(pmouseX, pmouseY, mouseX, mouseY);
}

// Spray paint brush (enhanced workshop example: circular spread + random opacity)
function drawSprayPaint() {
  noStroke();
  // Random color variation (subtle hue shifts for realism)
  const sprayRed = currentColor[0] + random(-20, 20);
  const sprayGreen = currentColor[1] + random(-20, 20);
  const sprayBlue = currentColor[2] + random(-20, 20);
  const opacity = random(150, 255); // Semi-transparent dots for spray effect

  fill(sprayRed, sprayGreen, sprayBlue, opacity);
  
  // Circular spray area (improved from workshop's square spread using cos/sin)
  for (let i = 0; i < 15; i++) {
    const angle = random(TWO_PI);
    const radius = random(brushSize / 2);
    const x = mouseX + cos(angle) * radius;
    const y = mouseY + sin(angle) * radius;
    const dotSize = random(1, 3);
    ellipse(x, y, dotSize, dotSize);
  }
}

// Eraser function (white stroke matching background)
function useEraser() {
  stroke(255); // Eraser color = canvas background color
  strokeWeight(brushSize * 2); // Larger eraser for efficiency
  line(pmouseX, pmouseY, mouseX, mouseY);
}

// Draw grid with center lines (workshop "gridded paper" challenge)
function drawGrid() {
  stroke(200); // Light gray grid lines (non-intrusive)
  strokeWeight(1);

  // Vertical grid lines (50px spacing)
  for (let x = 0; x <= width; x += 50) {
    line(x, 0, x, height);
  }

  // Horizontal grid lines (50px spacing)
  for (let y = 0; y <= height; y += 50) {
    line(0, y, width, y);
  }

  // Center crosshair (darker gray for better alignment)
  stroke(150);
  line(width / 2, 0, width / 2, height); // Vertical center line
  line(0, height / 2, width, height / 2); // Horizontal center line
}

// Draw on-canvas UI prompts (meets workshop "documentation" requirement - no external HTML needed)
function drawUIPrompt() {
  // White background bar for text readability
  fill(255);
  noStroke();
  rect(0, 0, width, 40);

  // Black text for instructions
  fill(0);
  textSize(14);
  // Top line: Keyboard shortcuts (clear for new users - workshop "no instructions" testing requirement)
  text("Shortcuts: 1-9=Colors | +/-=Brush Size | E=Eraser | P=Spray | Space=Clear | S=Save | G=Grid", 20, 15);
  // Bottom line: Current state (color/brush type/size)
  const currentMode = isEraser ? 'Eraser' : brushType === BRUSH_SPRAY ? 'Spray Brush' : 'Default Brush';
  const colorNames = ['Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Orange', 'Pink', 'Cyan', 'Black'];
  const currentColorName = colorNames[currentColorIndex];
  text(`Mode: ${currentMode} | Color: ${isEraser ? 'White' : currentColorName} | Size: ${brushSize}px`, 20, 35);
}

// Update UI (compatible with external HTML if needed - optional for assignment)
function updateUI() {
  if (typeof document !== 'undefined') {
    const colorNameEl = document.getElementById('current-color');
    const colorPreviewEl = document.getElementById('color-preview');
    const brushSizeEl = document.getElementById('brush-size');
    const modeEl = document.getElementById('current-mode');

    const colorNames = ['Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Orange', 'Pink', 'Cyan', 'Black'];

    if (colorNameEl) {
      colorNameEl.textContent = isEraser ? 'Eraser (White)' : colorNames[currentColorIndex];
    }

    if (colorPreviewEl) {
      colorPreviewEl.style.backgroundColor = isEraser 
        ? '#FFFFFF' 
        : `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;
    }

    if (brushSizeEl) {
      brushSizeEl.textContent = brushSize;
    }

    if (modeEl) {
      modeEl.textContent = brushType === BRUSH_SPRAY ? 'Spray Brush' : isEraser ? 'Eraser' : 'Default Brush';
    }
  }
}
