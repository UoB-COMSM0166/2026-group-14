import { AssetManager } from "./src/core/AssetManager.js";
import { SceneManager } from "./src/core/SceneManager.js";
import { UIOverlay } from "./src/ui/UIOverlay.js";
import { TestRunner } from "./src/testing/TestRunner.js";
import { BugLog } from "./src/testing/BugLog.js";
import { registerBalanceTests } from "./src/testing/BalanceTest.js";

const BRUSH_DEFAULT = "default";
const BRUSH_SPRAY = "spray";

const sketch = (p) => {
  let currentColor, brushSize, isEraser, showGrid;
  let colors, currentColorIndex, brushType;
  let assets, sceneManager, uiOverlay, testRunner, bugLog;
  let showAssetsPreview = false;

  p.preload = () => {
    assets = new AssetManager({ manifestPath: "assets_manifest.json", p: p });
    assets.preloadManifest("assets_manifest.json");
    assets.preloadImages();
    if (typeof assets.preloadAudio === "function") assets.preloadAudio();
  };

  p.setup = () => {
    const canvas = p.createCanvas(800, 600);
    canvas.parent("canvas-holder");
    p.background(255);

    window.__ASSETS__ = assets;
    sceneManager = new SceneManager();
    uiOverlay = new UIOverlay();
    testRunner = new TestRunner();
    bugLog = new BugLog();

    registerBalanceTests(testRunner);

    colors = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 0],
      [255, 0, 255],
      [255, 165, 0],
      [255, 192, 203],
      [0, 255, 255],
      [0, 0, 0],
    ];
    currentColorIndex = 0;
    currentColor = colors[0];
    brushSize = 10;
    isEraser = false;
    showGrid = false;
    brushType = BRUSH_DEFAULT;
  };

  p.draw = () => {
    if (showGrid) drawGrid();
    drawUIPrompt();

    if (p.mouseIsPressed) {
      if (p.mouseButton === p.LEFT) {
        if (isEraser) {
          useEraser();
        } else {
          if (brushType === BRUSH_DEFAULT) drawSmoothLine();
          else drawSprayPaint();
        }
      } else if (p.mouseButton === p.RIGHT) {
        useEraser();
      }
    }

    if (showAssetsPreview) drawAssetsPreview();
  };

  p.keyPressed = () => {
    const key = p.key;

    if (key >= "1" && key <= "9") {
      const index = parseInt(key) - 1;
      if (index < colors.length) {
        currentColorIndex = index;
        currentColor = colors[index];
        isEraser = false;
        brushType = BRUSH_DEFAULT;
      }
    }

    if (key === "+" || key === "=") brushSize = p.min(brushSize + 2, 50);
    if (key === "-" || key === "_") brushSize = p.max(brushSize - 2, 2);

    if (key === "e" || key === "E") {
      isEraser = !isEraser;
      brushType = BRUSH_DEFAULT;
    }

    if (key === " ") p.background(255);
    if (key === "s" || key === "S") p.save("portrait.jpg");
    if (key === "g" || key === "G") showGrid = !showGrid;

    if (key === "p" || key === "P") {
      brushType = brushType === BRUSH_DEFAULT ? BRUSH_SPRAY : BRUSH_DEFAULT;
      isEraser = false;
    }

    if (key === "l" || key === "L") showAssetsPreview = !showAssetsPreview;
    if (key === "t" || key === "T") runTests();
  };

  function drawSmoothLine() {
    p.stroke(currentColor[0], currentColor[1], currentColor[2]);
    p.strokeWeight(brushSize);
    p.noFill();
    p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
  }

  function drawSprayPaint() {
    p.noStroke();
    p.fill(
      currentColor[0] + p.random(-20, 20),
      currentColor[1] + p.random(-20, 20),
      currentColor[2] + p.random(-20, 20),
      p.random(150, 255)
    );
    for (let i = 0; i < 15; i++) {
      const angle = p.random(p.TWO_PI);
      const r = p.random(brushSize / 2);
      p.ellipse(p.mouseX + p.cos(angle) * r, p.mouseY + p.sin(angle) * r, p.random(1, 3));
    }
  }

  function useEraser() {
    p.stroke(255);
    p.strokeWeight(brushSize * 2);
    p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
  }

  function drawGrid() {
    p.stroke(200);
    p.strokeWeight(1);
    for (let x = 0; x <= p.width; x += 50) p.line(x, 0, x, p.height);
    for (let y = 0; y <= p.height; y += 50) p.line(0, y, p.width, y);
    p.stroke(150);
    p.line(p.width / 2, 0, p.width / 2, p.height);
    p.line(0, p.height / 2, p.width, p.height / 2);
  }

  function drawUIPrompt() {
    p.fill(255);
    p.noStroke();
    p.rect(0, 0, p.width, 40);
    p.fill(0);
    p.textSize(14);
    p.text(
      "Shortcuts: 1-9=Colors | +/-=Brush Size | E=Eraser | P=Spray | Space=Clear | S=Save | G=Grid | L=Assets | T=Tests",
      20, 15
    );
    const colorNames = ["Red", "Green", "Blue", "Yellow", "Magenta", "Orange", "Pink", "Cyan", "Black"];
    const mode = isEraser ? "Eraser" : brushType === BRUSH_SPRAY ? "Spray Brush" : "Default Brush";
    p.text(
      `Mode: ${mode} | Color: ${isEraser ? "White" : colorNames[currentColorIndex]} | Size: ${brushSize}px`,
      20, 35
    );
  }

  function drawAssetsPreview() {
    const x0 = p.width - 260;
    const y0 = 70;
    const w = 240;
    const h = p.height - 110;

    p.fill(255);
    p.stroke(0);
    p.strokeWeight(2);
    p.rect(x0, y0, w, h, 10);

    p.noStroke();
    p.fill(0);
    p.textSize(14);
    p.text("Assets Preview", x0 + 16, y0 + 24);

    const status = assets ? assets.getStatus() : null;
    const pick = (prefix) => {
      const keys = assets?.listImageKeys(prefix);
      return keys?.length ? keys[0] : "none";
    };

    let y = y0 + 52;
    p.text(`tower: ${pick("images.towers")}`, x0 + 16, y); y += 90;
    p.text(`enemy: ${pick("images.enemies")}`, x0 + 16, y); y += 90;
    p.text(`ui: ${pick("images.ui")}`, x0 + 16, y); y += 90;
    p.text(`map: ${pick("images.map")}`, x0 + 16, y);

    y = y0 + h - 44;
    p.text(`manifest: ${status?.manifestLoaded ? "ok" : "missing"}`, x0 + 16, y);
    p.text(`loaded imgs: ${status?.imageCount ?? 0}`, x0 + 16, y + 18);

    const img = assets?.getImage("images.map.tiles.grass");
    if (img) p.image(img, x0 + 16, y0 + 88, 96, 96);
  }

  function runTests() {
    try { testRunner.runAll(); } catch (e) { console.error(e); }
  }
};

new p5(sketch);