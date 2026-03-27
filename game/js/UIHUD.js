// UIHUD - User interface manager

class UIHUD {

  //@param {GameManager} game - Game engine reference

  constructor(game) {
    this.game = game;

    this.bgImage = null;
    this.settingsBgImg = null;

    this.playButton = null;
    this.settingsButton = null;
    this.exitButton = null;

    this.musicSlider = null;
    this.brightnessSlider = null;
    this.musicSelect = null;
    this.closeSettingsBtn = null;
    this.backBtn = null;

    this.brightnessValue = 200;

    this.waveBonusMessage = '';
    this.waveBonusUntilFrame = 0;
    this.waveBonusTimer = 0;

    this.placementMessage = '';
    this.placementMessageUntilFrame = 0;

    this.endScreenButtons = [];
    this.towerPanelTabs = [];
    this._panelLogged = false;  // print tab rects once to console

    this.settings = {
      musicVolume: 0.5,
      brightness: 1.0,
      musicTrack: 0
    };
    this._settingsDragTarget = null;  // 'music' | 'brightness' | null
  }


  setupUI() {
    this.createMenuButtons();
    this.createSettingsUI();
    this.hideAll();
  }

  createMenuButtons() {
    this.playButton = null;
    this.settingsButton = null;
    this.exitButton = null;
  }

  //Returns main menu button click regions for handleClick detection

  getMenuButtonRects() {
    const BW = 225;
    const BH = 63;
    const GAP = 19;
    const startY = CANVAS_HEIGHT / 2 - 50;
    const cx = CANVAS_WIDTH / 2;
    return [
      { id: 'start', x: cx - BW / 2, y: startY, w: BW, h: BH, action: 'start' },
      { id: 'settings', x: cx - BW / 2, y: startY + BH + GAP, w: BW, h: BH, action: 'settings' },
      { id: 'exit', x: cx - BW / 2, y: startY + (BH + GAP) * 2, w: BW, h: BH, action: 'exit' }
    ];
  }

  createSettingsUI() {
    let uiStyle = `
        background: #5D4037;
        color: #FFECB3;
        border: 3px solid #9b7b12;
        font-family: 'Georgia', serif;
        margin: -5px;
        padding: 8px 8px;
        font-size: 16px;
      `;

    this.musicSlider = createSlider(0, 1, 0.5, 0.01);

    this.musicSelect = createSelect();
    this.musicSelect.option('Epic Battle Music');
    this.musicSelect.option('Peaceful Village');
    this.musicSelect.option('Dark Dungeon');
    this.musicSelect.style(uiStyle);
    this.musicSelect.style('width', '160px');
    this.musicSelect.style('text-align', 'center');
    this.musicSelect.style('height', '35px');
    this.musicSelect.style('border', '2px solid #FFD54F');
    this.musicSelect.style('border-radius', '8px');
    this.musicSelect.style('text-align', 'center');
    this.musicSelect.style('text-align-last', 'center');
    this.musicSelect.style('box-sizing', 'border-box');
    this.musicSelect.style('appearance', 'none');
    this.musicSelect.style('-webkit-appearance', 'none');

    this.brightnessSlider = createSlider(10, 230, 100);

    this.closeSettingsBtn = createButton('');
    this.closeSettingsBtn.style('background', "url('assets/PNG/iconCross_brown.png') no-repeat center center");
    this.closeSettingsBtn.style('background-size', 'contain');
    this.closeSettingsBtn.style('border', 'none');
    this.closeSettingsBtn.style('width', '30px');
    this.closeSettingsBtn.style('height', '30px');
    this.closeSettingsBtn.style('cursor', 'pointer');
    this.closeSettingsBtn.mousePressed(() => {
      this.game.setState(GameState.MENU);
    });
    this.closeSettingsBtn.mouseOver(() => {
      this.closeSettingsBtn.style('transform', 'scale(1.1)');
    });
    this.closeSettingsBtn.mouseOut(() => {
      this.closeSettingsBtn.style('transform', 'scale(1.0)');
    });

    this.backBtn = createButton('Back to Menu');
    this.backBtn.style('background', '#795548');
    this.backBtn.style('color', '#FFECB3');
    this.backBtn.style('border', '2px solid #FFECB3');
    this.backBtn.style('border-radius', '6px');
    this.backBtn.style('padding', '8px 20px');
    this.backBtn.style('font-size', '18px');
    this.backBtn.style('font-weight', 'bold');
    this.backBtn.style('cursor', 'pointer');
    this.backBtn.style('font-family', "'Georgia', serif");
    this.backBtn.mousePressed(() => {
      this.game.setState(GameState.MENU);
    });
    this.backBtn.mouseOver(() => this.backBtn.style('background', '#A1887F'));
    this.backBtn.mouseOut(() => this.backBtn.style('background', '#795548'));
  }

  //Main menu - called when GameState.MENU

  drawMainMenu() {
    this.endScreenButtons = [];

    if (typeof gameImages !== 'undefined' && gameImages.mainBackground && gameImages.mainBackground.width > 0) {
      image(gameImages.mainBackground, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else if (this.bgImage) {
      image(this.bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      background(20, 60, 20);
    }

    this.applyBrightness();

    this.hideSettingsUI();
    this.hideMenuButtons();

    this.drawMenuButtons();
  }

  //Draw main menu buttons (image or fallback text)

  drawMenuButtons() {
    const BW = 225;
    const BH = 63;
    const GAP = 19;
    const startY = CANVAS_HEIGHT / 2 - 50;
    const cx = CANVAS_WIDTH / 2;

    const imgs = typeof gameImages !== 'undefined' ? gameImages : {};
    const hasStart = imgs.btnStart && imgs.btnStart.width > 0;
    const hasSettings = imgs.btnSettings && imgs.btnSettings.width > 0;
    const hasExit = imgs.btnExit && imgs.btnExit.width > 0;
    const useImages = hasStart && hasSettings && hasExit;

    if (!this._menuBtnDebugLogged) {
      this._menuBtnDebugLogged = true;
      console.log('[Debug] Drawing menu buttons, btnStart exists:', !!imgs.btnStart,
        'width:', imgs.btnStart ? imgs.btnStart.width : 0,
        'useImages:', useImages);
    }

    const centerYs = [
      startY + BH / 2,
      startY + BH + GAP + BH / 2,
      startY + (BH + GAP) * 2 + BH / 2
    ];

    for (let i = 0; i < 3; i++) {
      const cy = centerYs[i];
      const rect = this.getMenuButtonRects()[i];
      const hovered = getGameMouseX() >= rect.x && getGameMouseX() <= rect.x + rect.w &&
                      getGameMouseY() >= rect.y && getGameMouseY() <= rect.y + rect.h;
      const pressed = hovered && mouseIsPressed;

      let scaleFactor = 1;
      if (pressed) scaleFactor = 0.95;
      else if (hovered) scaleFactor = 1.08;

      push();
      translate(cx, cy);
      scale(scaleFactor);
      translate(-cx, -cy);

      if (useImages) {
        const img = i === 0 ? imgs.btnStart : (i === 1 ? imgs.btnSettings : imgs.btnExit);
        imageMode(CENTER);
        image(img, cx, cy, BW, BH);
        imageMode(CORNER);
      } else {
        // Fallback: dark rounded rect + white text
        noStroke();
        fill(60, 50, 40, 230);
        rect(rect.x, rect.y, rect.w, rect.h, 12);
        stroke(180, 160, 120);
        strokeWeight(2);
        noFill();
        rect(rect.x, rect.y, rect.w, rect.h, 12);
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(22);
        textStyle(BOLD);
        const labels = ['Start', 'Settings', 'Exit'];
        text(labels[i], cx, cy);
        textStyle(NORMAL);
      }

      pop();

      if (hovered) cursor(HAND);
    }
  }

  //Level select - called when GameState.LEVEL_SELECT

  drawLevelSelect() {
    push();

    if (typeof gameImages !== 'undefined' && gameImages.levelSelectBg && gameImages.levelSelectBg.width > 0) {
      image(gameImages.levelSelectBg, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    } else {
      // Fallback background
      background(40, 35, 30);
    }

    this.levelButtons = [
      {
        level: 1,
        x: 409,
        y: 457,
        width: 160,
        height: 150,
        unlocked: true,
        name: "THE OUTER DEFENSES"
      },
      {
        level: 2,
        x: 1067,
        y: 526,
        width: 162,
        height: 156,
        unlocked: true,
        name: "RIVER THAMES PATROL"
      },
      {
        level: 3,
        x: 1566,
        y: 282,
        width: 300,
        height: 189,
        unlocked: true,
        name: "TOWER OF LONDON SIEGE"
      }
    ];

    for (let btn of this.levelButtons) {
      let mx = typeof getGameMouseX === 'function' ? getGameMouseX() : mouseX;
      let my = typeof getGameMouseY === 'function' ? getGameMouseY() : mouseY;

      let left = btn.x - btn.width / 2;
      let right = btn.x + btn.width / 2;
      let top = btn.y - btn.height / 2;
      let bottom = btn.y + btn.height / 2;

      let isHover = mx >= left && mx <= right && my >= top && my <= bottom;

      if (isHover && btn.unlocked) {
        noFill();
        stroke(255, 215, 0);
        strokeWeight(4);
        rectMode(CENTER);
        rect(btn.x, btn.y, btn.width, btn.height, 10);
      }

      if (!btn.unlocked) {
        fill(0, 0, 0, 150);
        noStroke();
        rectMode(CENTER);
        rect(btn.x, btn.y, btn.width, btn.height, 10);

        fill(255, 255, 255, 200);
        textAlign(CENTER, CENTER);
        textSize(18);
        text("🔒 Coming Soon", btn.x, btn.y);
      }
    }

    this.backButton = {
      x: 100,
      y: 50,
      width: 120,
      height: 50
    };

    let mx = typeof getGameMouseX === 'function' ? getGameMouseX() : mouseX;
    let my = typeof getGameMouseY === 'function' ? getGameMouseY() : mouseY;
    let backHover = mx > this.backButton.x - this.backButton.width / 2 &&
                    mx < this.backButton.x + this.backButton.width / 2 &&
                    my > this.backButton.y - this.backButton.height / 2 &&
                    my < this.backButton.y + this.backButton.height / 2;

    fill(backHover ? color(80, 60, 40, 230) : color(50, 40, 30, 204));
    stroke(backHover ? '#FFD700' : '#C8A84E');
    strokeWeight(2);
    rectMode(CENTER);
    rect(this.backButton.x, this.backButton.y, this.backButton.width, this.backButton.height, 10);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    text("← Back", this.backButton.x, this.backButton.y);

    pop();
  }

  /**
   * Handle main menu click, return true if handled
   */
  handleMenuClick(mx, my) {
    const rects = this.getMenuButtonRects();
    for (const r of rects) {
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        if (r.action === 'start') this.game.setState(GameState.LEVEL_SELECT);
        else if (r.action === 'settings') this.game.setState(GameState.SETTINGS);
        else if (r.action === 'exit') window.location.href = 'about:blank';
        return true;
      }
    }
    return false;
  }

  /**
   * Settings page - called when GameState.SETTINGS
   */
  drawSettings() {
    this.endScreenButtons = [];

    if (this.bgImage) {
      image(this.bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      background(40, 30, 20);
    }

    this.applyBrightness();
    this.hideMenuButtons();

    let imgW = 500;
    let imgH = 600;
    if (this.settingsBgImg) {
      imageMode(CENTER);
      image(this.settingsBgImg, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, imgW, imgH);
      imageMode(CORNER);
    }

    textAlign(CENTER, CENTER);
    fill(255);
    textSize(32);
    textStyle(BOLD);
    text("SETTINGS", CANVAS_WIDTH / 2 + 2, CANVAS_HEIGHT / 2 - imgH / 2 + 102);
    textStyle(NORMAL);

    textSize(18);
    let labelX = CANVAS_WIDTH / 2 - 150;
    let startY = CANVAS_HEIGHT / 2 - 100;
    let spacing = 55;

    text("Music Volume :", labelX, startY);
    text("Switch Track :", labelX, startY + spacing);
    text("Brightness :", labelX, startY + spacing * 2);

    this.showSettingsUI(startY, spacing);
  }

  /**
   * Draw top HUD bar (45px)
   * @param {boolean} showPaused - Show PAUSED in centre
   */
  drawTopHUDBar(showPaused = false) {
    const H = HUD_HEIGHT;
    const leftX = 15;

    noStroke();
    fill(30, 25, 18, 224);  // rgba(30, 25, 18, 0.88) ≈ 224
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, H);

    stroke(200, 168, 78);  // #C8A84E
    strokeWeight(2);
    line(0, H, CANVAS_WIDTH, H);
    noStroke();


    let hp = this.game.landmark ? Math.floor(this.game.landmark.hp) : 0;
    let maxHp = this.game.landmark ? Math.floor(this.game.landmark.maxHp) : 0;
    let name = this.game.landmark ? this.game.landmark.name : 'Landmark';
    let hpPercent = maxHp > 0 ? hp / maxHp : 0;

    let centerX = CANVAS_WIDTH / 2;
    let barW = 160;
    let barH = 14;
    let barX = centerX - barW / 2;
    let barY = 24;

    fill(255, 255, 255, 204);  // rgba(255,255,255,0.8)
    textAlign(CENTER, CENTER);
    textSize(13);
    text(name, centerX, 10);

    fill(60, 60, 60, 204);
    rect(barX, barY, barW, barH, 7);

    if (hpPercent > 0.6) {
      fill(76, 175, 80);  // #4CAF50
    } else if (hpPercent > 0.3) {
      fill(255, 193, 7);  // #FFC107
    } else {
      fill(244, 67, 54);  // #F44336
    }
    rect(barX, barY, barW * hpPercent, barH, 7);

    let hpText = `${hp} / ${maxHp}`;
    textSize(10);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    fill(0, 0, 0, 150);
    text(hpText, centerX + 1, barY + barH / 2 + 1);
    fill(255);
    text(hpText, centerX, barY + barH / 2);
    textStyle(NORMAL);

    let rightEdge = CANVAS_WIDTH - 15;
    let waveDisplay = '';
    let waveState = '';
    let currWave = 1;
    let totalWaves = 1;
    if (this.game.waveManager) {
      waveDisplay = this.game.waveManager.getCurrentWaveDisplay();
      waveState = this.game.waveManager.getWaveStateText();
      currWave = Math.min(this.game.waveManager.currentWaveIndex + 1, this.game.waveManager.waves.length);
      totalWaves = this.game.waveManager.waves.length;
    }
    fill(255, 255, 255, 204);
    textSize(13);
    textAlign(RIGHT, CENTER);
    text('Wave', rightEdge, 10);
    textSize(18);
    textStyle(BOLD);
    let suffix = ' / ' + totalWaves;
    let currStr = String(currWave);
    fill(255);
    text(suffix, rightEdge, 31);
    fill(255, 215, 0);
    text(currStr, rightEdge - textWidth(suffix), 31);
    textStyle(NORMAL);
    if (waveState && (waveState.indexOf('Next wave') !== -1 || waveState.indexOf('incoming') !== -1)) {
      fill(255, 200, 100, 179);
      textSize(10);
      textAlign(RIGHT, CENTER);
      text('Next wave incoming...', rightEdge, 40);
    }

    if (showPaused) {
      fill(255, 215, 0, 220);
      textAlign(CENTER, CENTER);
      textSize(14);
      textStyle(BOLD);
      text('⏸ PAUSED', centerX, 22);
      textStyle(NORMAL);
    }
  }

  //In-game HUD - called when GameState.PLAYING

  drawHUD() {
    this.hideAll();
    this.endScreenButtons = [];
    cursor(ARROW);

    this.drawTopHUDBar(false);

    if (this.waveBonusMessage && this.waveBonusTimer > 0) {
      push();

      let alpha = 255;
      if (this.waveBonusTimer < 30) {
        alpha = Math.floor(this.waveBonusTimer * 255 / 30);
      } else if (this.waveBonusTimer > 150) {
        alpha = Math.floor((180 - this.waveBonusTimer) * 255 / 30);
      }

      let msgW = 400;
      let msgH = 100;
      let msgX = CANVAS_WIDTH / 2 - msgW / 2;
      let msgY = CANVAS_HEIGHT / 2 - msgH / 2;

      fill(0, 0, 0, alpha * 0.7);
      noStroke();
      rectMode(CORNER);
      rect(msgX, msgY, msgW, msgH, 15);

      stroke(255, 215, 0, alpha);
      strokeWeight(3);
      noFill();
      rect(msgX, msgY, msgW, msgH, 15);

      fill(255, 215, 0, alpha);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(32);
      textStyle(BOLD);
      text("WAVE COMPLETE!", CANVAS_WIDTH / 2, msgY + 35);

      fill(255, 255, 255, alpha);
      textSize(24);
      textStyle(NORMAL);
      text(this.waveBonusMessage, CANVAS_WIDTH / 2, msgY + 70);

      pop();

      this.waveBonusTimer--;
    }

    if (this.placementMessage && frameCount <= this.placementMessageUntilFrame) {
      textAlign(CENTER, CENTER);
      textSize(18);
      fill(255, 80, 80);
      let msgW = 240, msgH = 34;
      let msgX = CANVAS_WIDTH / 2 - msgW / 2;
      let msgY = CANVAS_HEIGHT / 2 - msgH / 2;
      fill(0, 0, 0, 160);
      noStroke();
      rect(msgX, msgY, msgW, msgH, 8);
      fill(255, 90, 90);
      text(this.placementMessage, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    this.drawTowerPanel();
    this.drawTowerHoverInfo();
  }

  showWaveBonus(message, durationFrames = WAVE_BONUS_DISPLAY_FRAMES) {
    this.waveBonusMessage = message;
    this.waveBonusUntilFrame = frameCount + durationFrames;
    this.waveBonusTimer = 180;
  }

  /** Show a "Can't build here!" style placement error for ~1.5 s. */
  showPlacementError(message, durationFrames = 90) {
    this.placementMessage = message;
    this.placementMessageUntilFrame = frameCount + durationFrames;
  }

  /**
   * Win screen - called when GameState.WIN
   */
  drawWinScreen() {
    this.hideAll();
    this.endScreenButtons = [];
    cursor(ARROW);

    let stats = this._getEndStats();

    fill(0, 70, 30, 170);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    textStyle(BOLD);
    text("VICTORY!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 220);

    textStyle(NORMAL);
    fill(170, 255, 190);
    textSize(24);
    text("London is saved!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 175);

    let panelW = 440;
    let panelH = 180;
    let panelX = CANVAS_WIDTH / 2 - panelW / 2;
    let panelY = CANVAS_HEIGHT / 2 - 120;
    fill(0, 0, 0, 120);
    stroke(180, 255, 200, 220);
    strokeWeight(2);
    rect(panelX, panelY, panelW, panelH, 12);
    noStroke();

    fill(235);
    textAlign(LEFT, CENTER);
    textSize(24);
    let lineX = panelX + 24;
    text(`Landmark HP: ${stats.landmarkHp}/${stats.landmarkMaxHp}`, lineX, panelY + 35);
    text(`Enemies Defeated: ${stats.totalKills}`, lineX, panelY + 75);
    text(`Gold Remaining: ${stats.goldRemaining}`, lineX, panelY + 115);
    text(`Waves Survived: ${stats.waveSurvived}/${stats.totalWaves}`, lineX, panelY + 155);

    let buttonY = panelY + panelH + 35;
    this._drawEndScreenButton(
      { label: "Play Again", x: CANVAS_WIDTH / 2 - 160, y: buttonY, w: 140, h: 46, action: "restart" },
      { r: 40, g: 130, b: 70 }
    );
    this._drawEndScreenButton(
      { label: "Main Menu", x: CANVAS_WIDTH / 2 + 20, y: buttonY, w: 140, h: 46, action: "menu" },
      { r: 95, g: 80, b: 50 }
    );
  }

  //Lose screen - called when GameState.LOSE

  drawLoseScreen() {
    this.hideAll();
    this.endScreenButtons = [];
    cursor(ARROW);

    let stats = this._getEndStats();

    fill(90, 0, 0, 175);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    textStyle(BOLD);
    text("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 220);

    textStyle(NORMAL);
    textSize(24);
    fill(255, 170, 170);
    text("Big Ben has fallen...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 175);

    let panelW = 440;
    let panelH = 145;
    let panelX = CANVAS_WIDTH / 2 - panelW / 2;
    let panelY = CANVAS_HEIGHT / 2 - 105;
    fill(0, 0, 0, 120);
    stroke(255, 155, 155, 210);
    strokeWeight(2);
    rect(panelX, panelY, panelW, panelH, 12);
    noStroke();

    fill(235);
    textAlign(LEFT, CENTER);
    textSize(24);
    let lineX = panelX + 24;
    text(`Waves Survived: ${stats.waveSurvived}/${stats.totalWaves}`, lineX, panelY + 35);
    text(`Enemies Defeated: ${stats.totalKills}`, lineX, panelY + 75);
    text(`Gold Remaining: ${stats.goldRemaining}`, lineX, panelY + 115);

    let buttonY = panelY + panelH + 35;
    this._drawEndScreenButton(
      { label: "Try Again", x: CANVAS_WIDTH / 2 - 160, y: buttonY, w: 140, h: 46, action: "restart" },
      { r: 135, g: 45, b: 45 }
    );
    this._drawEndScreenButton(
      { label: "Main Menu", x: CANVAS_WIDTH / 2 + 20, y: buttonY, w: 140, h: 46, action: "menu" },
      { r: 95, g: 80, b: 50 }
    );
  }

  //Pause screen - called when GameState.PAUSED

  drawPauseScreen() {
    this.hideAll();
    this.endScreenButtons = [];

    this.drawTopHUDBar(true);

    fill(0, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, HUD_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - HUD_HEIGHT);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(64);
    textStyle(BOLD);
    text("⏸  PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    textStyle(NORMAL);
    fill(200);
    textSize(20);
    text("Press P → Resume    Press R → Restart",
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  }

  applyBrightness() {
    if (this.brightnessSlider) {
      this.brightnessValue = this.brightnessSlider.value();
      select('body').style('filter', `brightness(${this.brightnessValue}%)`);

      select('body').style('background-color', '#000');
    }

  }

  showMenuButtons() {
    if (this.playButton) this.playButton.show();
    if (this.settingsButton) this.settingsButton.show();
    if (this.exitButton) this.exitButton.show();
  }

  hideMenuButtons() {
    if (this.playButton) this.playButton.hide();
    if (this.settingsButton) this.settingsButton.hide();
    if (this.exitButton) this.exitButton.hide();
  }

  showSettingsUI(startY, spacing) {
    let sliderX = DESIGN_WIDTH / 2 - 50;
    let imgW = 500;
    let imgH = 600;

    const toScreen = typeof toScreenCoords === 'function' ? toScreenCoords : (x, y) => ({ x, y });

    if (this.musicSlider) {
      this.musicSlider.show();
      let pos = toScreen(sliderX, startY - 10);
      this.musicSlider.position(pos.x, pos.y);
    }
    if (this.musicSelect) {
      this.musicSelect.show();
      let pos = toScreen(sliderX, startY + spacing - 10);
      this.musicSelect.position(pos.x, pos.y);
    }
    if (this.brightnessSlider) {
      this.brightnessSlider.show();
      let pos = toScreen(sliderX, startY + spacing * 2 - 10);
      this.brightnessSlider.position(pos.x, pos.y);
    }
    if (this.closeSettingsBtn) {
      this.closeSettingsBtn.show();
      let pos = toScreen(DESIGN_WIDTH / 2 - imgW / 2 + 25, DESIGN_HEIGHT / 2 - imgH / 2 + 25);
      this.closeSettingsBtn.position(pos.x, pos.y);
    }
    if (this.backBtn) {
      this.backBtn.show();
      let pos = toScreen(DESIGN_WIDTH / 2 - 70, DESIGN_HEIGHT / 2 + 100);
      this.backBtn.position(pos.x, pos.y);
    }
  }

  hideSettingsUI() {
    if (this.musicSlider) this.musicSlider.hide();
    if (this.musicSelect) this.musicSelect.hide();
    if (this.brightnessSlider) this.brightnessSlider.hide();
    if (this.closeSettingsBtn) this.closeSettingsBtn.hide();
    if (this.backBtn) this.backBtn.hide();
  }

  hideAll() {
    this.hideMenuButtons();
    this.hideSettingsUI();
  }

  //Calculate the clickable rect for each tower-select tab.
  //Dynamic layout based on available towers per level.
  //Returned objects: { type, x, y, w, h }

  getTowerPanelTabs() {
    const availableTowers = (this.game && this.game.availableTowers) || LEVEL_AVAILABLE_TOWERS[1];
    const BTN_W  = 130;
    const BTN_H  = 70;
    const BTN_GAP = 25;
    const count = availableTowers.length;
    const totalW  = BTN_W * count + BTN_GAP * (count - 1);
    const startX  = Math.floor((CANVAS_WIDTH - totalW) / 2);
    const tabY    = TOWER_PANEL_TOP + Math.floor((TOWER_PANEL_HEIGHT - BTN_H) / 2);

    return availableTowers.map((type, i) => ({
      type,
      x: startX + i * (BTN_W + BTN_GAP),
      y: tabY,
      w: BTN_W,
      h: BTN_H
    }));
  }

  getTowerImage(towerType) {
    let imgs = (typeof gameImages !== 'undefined') ? gameImages : {};
    switch (towerType) {
      case 'basic': return imgs.towerBasic;
      case 'slow': return imgs.towerSlow || imgs.towerSlowActive;
      case 'area': return imgs.towerAreaFire || imgs.towerArea;
      case 'crystal': return imgs.towerCrystal || imgs.towerCrystalActive;
      case 'steam': return imgs.towerSteam || imgs.towerSteamFire;
      case 'alchemist': return imgs.towerAlchemist || imgs.towerAlchemistFire;
      default: return null;
    }
  }

  getTowerSpecialText(towerType) {
    switch (towerType) {
      case 'basic': return "Balanced tower";
      case 'slow': return " Slows enemies by 45%";
      case 'area': return " Damages all enemies in range";
      case 'crystal': return " Boosts nearby towers +25% DMG";
      case 'steam': return " Pierces through 3 enemies";
      case 'alchemist': return " Random potion effects";
      default: return null;
    }
  }

  drawTowerTooltip(towerType, mx, my) {
    let config = TOWER_TYPES[towerType];
    if (!config) return;

    push();

    let tipW = 220;
    let tipH = 160;

    let tipX = mx - tipW / 2;
    let tipY = my - tipH - 20;

    if (tipX < 10) tipX = 10;
    if (tipX + tipW > CANVAS_WIDTH - 10) tipX = CANVAS_WIDTH - tipW - 10;
    if (tipY < 10) tipY = my + 30;

    fill(0, 0, 0, 80);
    noStroke();
    rectMode(CORNER);
    rect(tipX + 4, tipY + 4, tipW, tipH, 10);

    fill(60, 50, 40, 245);
    stroke(180, 150, 100);
    strokeWeight(2);
    rect(tipX, tipY, tipW, tipH, 10);

    fill(255, 220, 150);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(18);
    textStyle(BOLD);
    text(config.name, tipX + tipW / 2, tipY + 12);
    textStyle(NORMAL);

    stroke(150, 120, 80);
    strokeWeight(1);
    line(tipX + 15, tipY + 38, tipX + tipW - 15, tipY + 38);
    noStroke();

    let attrY = tipY + 48;
    let lineH = 20;
    let labelX = tipX + 15;
    let valueX = tipX + tipW - 15;

    textSize(13);

    fill(200, 200, 200);
    textAlign(LEFT, TOP);
    text("Cost:", labelX, attrY);
    fill(255, 215, 0);
    textAlign(RIGHT, TOP);
    text("$" + config.cost, valueX, attrY);
    attrY += lineH;

    fill(200, 200, 200);
    textAlign(LEFT, TOP);
    text("Damage:", labelX, attrY);
    fill(255, 100, 100);
    textAlign(RIGHT, TOP);
    text(config.damage, valueX, attrY);
    attrY += lineH;

    fill(200, 200, 200);
    textAlign(LEFT, TOP);
    text("Fire Rate:", labelX, attrY);
    fill(100, 200, 255);
    textAlign(RIGHT, TOP);
    let speedText = config.fireRate <= 50 ? "Fast" : config.fireRate <= 80 ? "Medium" : "Slow";
    text(speedText, valueX, attrY);
    attrY += lineH;

    fill(200, 200, 200);
    textAlign(LEFT, TOP);
    text("Range:", labelX, attrY);
    fill(150, 255, 150);
    textAlign(RIGHT, TOP);
    text(config.range + "px", valueX, attrY);
    attrY += lineH;

    let specialText = this.getTowerSpecialText(towerType);
    if (specialText) {
      fill(255, 200, 100);
      textAlign(CENTER, TOP);
      textSize(11);
      text(specialText, tipX + tipW / 2, attrY + 5);
    }

    pop();
  }

  drawTowerPanel() {
    let tabs = this.getTowerPanelTabs();
    this.towerPanelTabs = tabs;
    this.towerButtons = tabs.map(t => ({ type: t.type, x: t.x, y: t.y, w: t.w, h: t.h }));
    this.hoveredTower = null;

    let imgs = (typeof gameImages !== 'undefined') ? gameImages : {};
    const PY = TOWER_PANEL_TOP;
    const PH = TOWER_PANEL_HEIGHT;
    const panelCY = PY + PH / 2;

    // ── Background: dark brown, code-drawn ───────────────────────
    noStroke();
    fill(40, 30, 20, 235);
    rectMode(CORNER);
    rect(0, PY, CANVAS_WIDTH, PH);

    // Gold separator line at top
    stroke(200, 168, 78, 220);
    strokeWeight(2);
    line(0, PY, CANVAS_WIDTH, PY);
    noStroke();

    let currentGold = this.game.economy ? this.game.economy.getGold() : 0;

    // ── Left side: Settings + Pause buttons, then coin + gold ─────
    let btnStartX = 15;
    let btnY = PY + 8;
    let btnW = 65;
    let btnH = PH - 16;
    let btnGap = 8;

    let mx = getGameMouseX();
    let my = getGameMouseY();

    // --- Settings button ---
    let settingsBtnX = btnStartX;
    let isSettingsHover = mx >= settingsBtnX && mx <= settingsBtnX + btnW &&
                          my >= btnY && my <= btnY + btnH;

    fill(isSettingsHover ? color(100, 80, 60) : color(55, 45, 35));
    stroke(isSettingsHover ? color(220, 180, 100) : color(120, 100, 70));
    strokeWeight(2);
    rectMode(CORNER);
    rect(settingsBtnX, btnY, btnW, btnH, 6);

    fill(isSettingsHover ? color(255, 230, 180) : color(180, 160, 120));
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text("S", settingsBtnX + btnW / 2, btnY + btnH / 2 - 5);
    textSize(9);
    text("Settings", settingsBtnX + btnW / 2, btnY + btnH / 2 + 14);

    this.inGameSettingsBtn = { x: settingsBtnX, y: btnY, w: btnW, h: btnH };

    // --- Pause/Resume button ---
    let pauseBtnX = settingsBtnX + btnW + btnGap;
    let isPauseHover = mx >= pauseBtnX && mx <= pauseBtnX + btnW &&
                       my >= btnY && my <= btnY + btnH;

    let isPaused = (typeof game !== 'undefined' && game.manualPaused);

    fill(isPauseHover ? color(100, 80, 60) : color(55, 45, 35));
    stroke(isPauseHover ? color(220, 180, 100) : color(120, 100, 70));
    strokeWeight(2);
    rect(pauseBtnX, btnY, btnW, btnH, 6);

    fill(isPauseHover ? color(255, 230, 180) : color(180, 160, 120));
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    if (isPaused) {
      text(">", pauseBtnX + btnW / 2, btnY + btnH / 2 - 5);
      textSize(9);
      text("Resume", pauseBtnX + btnW / 2, btnY + btnH / 2 + 14);
    } else {
      text("||", pauseBtnX + btnW / 2, btnY + btnH / 2 - 5);
      textSize(9);
      text("Pause", pauseBtnX + btnW / 2, btnY + btnH / 2 + 14);
    }

    this.pauseBtn = { x: pauseBtnX, y: btnY, w: btnW, h: btnH };

    // --- Monster Info button - use monster image instead of "!" ---
    let monsterBtnX = pauseBtnX + btnW + btnGap;
    let isMonsterHover = mx >= monsterBtnX && mx <= monsterBtnX + btnW &&
                         my >= btnY && my <= btnY + btnH;

    fill(isMonsterHover ? color(100, 80, 60) : color(55, 45, 35));
    stroke(isMonsterHover ? color(220, 180, 100) : color(120, 100, 70));
    strokeWeight(2);
    rect(monsterBtnX, btnY, btnW, btnH, 6);

    // Draw monster icon image
    let monsterIcon = this.getEnemyImage('basic');  // Use Guard as icon
    if (monsterIcon && monsterIcon.width > 0) {
      imageMode(CENTER);
      let iconSize = 32;
      image(monsterIcon, monsterBtnX + btnW / 2, btnY + btnH / 2 - 3, iconSize, iconSize);
    } else {
      // Fallback text if no image
      fill(isMonsterHover ? color(255, 230, 180) : color(180, 160, 120));
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(16);
      text("?", monsterBtnX + btnW / 2, btnY + btnH / 2 - 5);
    }

    // Label below icon
    fill(isMonsterHover ? color(255, 230, 180) : color(180, 160, 120));
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(9);
    text("Enemies", monsterBtnX + btnW / 2, btnY + btnH - 8);

    this.monsterInfoBtn = { x: monsterBtnX, y: btnY, w: btnW, h: btnH };

    // --- Coin + gold (right of buttons) ---
    let coinStartX = monsterBtnX + btnW + btnGap + 25;
    let coinCX     = coinStartX + 37;  // coin center at coinCX-22, amount at coinCX-8
    let coinCY     = panelCY;

    // Coin circle
    fill(255, 210, 0);
    ellipse(coinCX - 22, coinCY, 24, 24);
    fill(180, 130, 0);
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text('$', coinCX - 22, coinCY);
    textStyle(NORMAL);

    // Amount
    fill(255, 225, 70);
    textAlign(LEFT, CENTER);
    textSize(20);
    textStyle(BOLD);
    text(currentGold, coinCX - 8, coinCY);
    textStyle(NORMAL);

    // ── Tower buttons ─────────────────────────────────────────────
    const thumbImgMap = {
      basic: imgs.towerBasic,
      slow:  imgs.towerSlow,
      area:  imgs.towerAreaFire,
      crystal: imgs.towerCrystal || imgs.towerCrystalActive,
      steam: imgs.towerSteam || imgs.towerSteamFire,
      alchemist: imgs.towerAlchemist || imgs.towerAlchemistFire
    };
    const THUMB      = 40;
    const THUMB_CX_OFF = 8 + THUMB / 2;  // px from button left edge to thumb centre

    for (let i = 0; i < tabs.length; i++) {
      let tab = tabs[i];
      let cfg = TOWER_TYPES[tab.type];
      let affordable = currentGold >= cfg.cost;
      let selected   = this.game.selectedTowerType === tab.type;
      let hovering   = getGameMouseX() >= tab.x && getGameMouseX() <= tab.x + tab.w &&
                       getGameMouseY() >= tab.y && getGameMouseY() <= tab.y + tab.h;

      if (hovering) this.hoveredTower = tab.type;

      // ── Button background ──
      rectMode(CORNER);
      if (selected) {
        fill(85, 68, 40, 240);
        stroke(200, 168, 78);
        strokeWeight(2);
      } else if (hovering && affordable) {
        fill(68, 56, 36, 225);
        stroke(180, 150, 60, 210);
        strokeWeight(1.5);
      } else {
        fill(60, 50, 35, 210);
        stroke(100, 80, 40, 150);
        strokeWeight(1);
      }
      rect(tab.x, tab.y, tab.w, tab.h, 8);
      noStroke();

      // ── Thumbnail (left 1/3 of button) ──
      let thumbCX = tab.x + THUMB_CX_OFF;
      let thumbCY = tab.y + tab.h / 2;
      let thumb   = thumbImgMap[tab.type];

      if (thumb && thumb.width > 0) {
        tint(255, affordable ? 255 : 100);
        imageMode(CENTER);
        image(thumb, thumbCX, thumbCY, THUMB, THUMB);
        noTint();
      } else {
        let [r, g, b] = cfg.color;
        fill(r, g, b, affordable ? 220 : 90);
        ellipse(thumbCX, thumbCY, 32, 32);
      }

      // ── Text area (right 2/3 of button) ──
      let textX  = tab.x + THUMB_CX_OFF + THUMB / 2 + 8;
      let nameY  = tab.y + tab.h / 2 - 10;
      let priceY = tab.y + tab.h / 2 + 11;

      // Tower name
      fill(255, 255, 255, affordable ? 240 : 130);
      textAlign(LEFT, CENTER);
      textSize(14);
      textStyle(BOLD);
      text(cfg.name.split(' ')[0], textX, nameY);
      textStyle(NORMAL);

      // Price
      fill(255, 215, 0, affordable ? 255 : 110);
      textSize(13);
      text(`$${cfg.cost}`, textX, priceY);

      // Keyboard shortcut badge (top-right corner)
      fill(160, 140, 80, affordable ? 200 : 90);
      textAlign(RIGHT, TOP);
      textSize(11);
      text(`[${i + 1}]`, tab.x + tab.w - 5, tab.y + 4);

      // ── Affordability dim overlay ──
      if (!affordable) {
        noStroke();
        fill(0, 0, 0, 120);
        rectMode(CORNER);
        rect(tab.x, tab.y, tab.w, tab.h, 8);
      }

      if (hovering && affordable) cursor(HAND);
    }

    if (this.hoveredTower) {
      this.drawTowerTooltip(this.hoveredTower, getGameMouseX(), getGameMouseY());
    }

    if (!this._panelLogged) {
      this._panelLogged = true;
      console.log('[Debug] Tower Panel Button Bounds');
      for (let tab of tabs) {
        console.log(
          `[Debug] ${tab.type}: x=${tab.x.toFixed(0)} y=${tab.y.toFixed(0)} ` +
          `w=${tab.w} h=${tab.h} | right=${(tab.x + tab.w).toFixed(0)} ` +
          `bottom=${(tab.y + tab.h).toFixed(0)}`
        );
      }
    }
  }

  drawTowerHoverInfo() {
    if (!this.game.towers || this.game.towers.length === 0) return;
    let mx = getGameMouseX();
    let my = getGameMouseY();
    let hoverRadius = CURRENT_GRID_SIZE * 0.6;

    for (let tower of this.game.towers) {
      let d = dist(mx, my, tower.x, tower.y);
      if (d <= hoverRadius) {
        this.drawTowerInfo(tower);
        break;
      }
    }
  }

  drawTowerInfo(tower) {
    let cfg = TOWER_TYPES[tower.type] || {};
    let x = tower.x + 45;
    let y = tower.y - 30;
    let w = 180;
    let h = tower.type === 'crystal' ? 110 : 70;

    push();
    fill(0, 0, 0, 200);
    stroke(200, 168, 78);
    strokeWeight(2);
    rectMode(CORNER);
    rect(x, y, w, h, 8);
    noStroke();

    fill(255);
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text(cfg.name || tower.type, x + 10, y + 10);
    textStyle(NORMAL);
    textSize(12);
    fill(200);
    text(`$${cfg.cost}`, x + 10, y + 30);

    if (tower.type === 'crystal') {
      let boostedCount = this.game.towers.filter(t =>
        t.type !== 'crystal' &&
        dist(t.x, t.y, tower.x, tower.y) <= tower.boostRadius
      ).length;
      fill(200, 150, 255);
      text(`Boosting ${boostedCount} towers`, x + 10, y + 50);
      text(`+${Math.round(tower.boostDamage * 100)}% Damage`, x + 10, y + 68);
      text(`+${Math.round(tower.boostFireRate * 100)}% Fire Rate`, x + 10, y + 86);
    } else if (!tower.isSupport) {
      fill(180);
      text(`Dmg: ${tower.getEffectiveDamage ? tower.getEffectiveDamage() : tower.damage}`, x + 10, y + 50);
      text(`Range: ${tower.range}`, x + 10, y + 65);
    }
    pop();
  }

  //In-game settings panel (canvas)

  drawInGameSettings() {
    push();

    let panelW = 520;
    let panelH = 450;

    let panelX = Math.floor((CANVAS_WIDTH - panelW) / 2);
    let panelY = Math.floor((CANVAS_HEIGHT - panelH) / 2);

    let centerX = panelX + panelW / 2;

    fill(0, 0, 0, 100);
    noStroke();
    rectMode(CORNER);
    rect(panelX + 10, panelY + 10, panelW, panelH, 15);

    fill(80, 60, 45, 250);
    stroke(180, 150, 100);
    strokeWeight(4);
    rect(panelX, panelY, panelW, panelH, 15);

    stroke(120, 90, 60);
    strokeWeight(2);
    rect(panelX + 12, panelY + 12, panelW - 24, panelH - 24, 10);
    noStroke();

    fill(255, 220, 150);
    textAlign(CENTER, CENTER);
    textSize(36);
    textStyle(BOLD);
    text("SETTINGS", centerX, panelY + 55);
    textStyle(NORMAL);

    stroke(150, 120, 80);
    strokeWeight(2);
    line(panelX + 40, panelY + 95, panelX + panelW - 40, panelY + 95);
    noStroke();

    let labelX = panelX + 50;
    let sliderX = panelX + 200;
    let sliderW = 230;
    let startY = panelY + 145;
    let spacing = 85;

    // Music Volume
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(20);
    text("Music Volume", labelX, startY);
    this.drawCustomSlider(sliderX, startY - 12, sliderW, 24, this.settings.musicVolume, 'music');
    fill(200);
    textSize(16);
    textAlign(LEFT, CENTER);
    text(Math.round(this.settings.musicVolume * 100) + '%', sliderX + sliderW + 15, startY);

    // Music Track
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(20);
    text("Music Track", labelX, startY + spacing);
    this.drawTrackSelector(sliderX, startY + spacing - 18, sliderW, 36);

    // Brightness
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(20);
    text("Brightness", labelX, startY + spacing * 2);
    let brightnessNorm = (this.settings.brightness - 0.5) / 1.0;
    this.drawCustomSlider(sliderX, startY + spacing * 2 - 12, sliderW, 24, brightnessNorm, 'brightness');
    fill(200);
    textSize(16);
    textAlign(LEFT, CENTER);
    text(Math.round(this.settings.brightness * 100) + '%', sliderX + sliderW + 15, startY + spacing * 2);

    let btnW = 200;
    let btnH = 55;
    let btnX = centerX - btnW / 2;
    let btnY = panelY + panelH - 90;
    this.drawSettingsButton(btnX, btnY, btnW, btnH, "Resume Game", 'back');

    this.drawCloseButton(panelX + panelW - 48, panelY + 18, 32);

    pop();
  }

  drawCustomSlider(x, y, w, h, value, id) {
    value = Math.max(0, Math.min(1, value));
    this._sliderRects = this._sliderRects || {};
    this._sliderRects[id] = { x, y, w, h };

    fill(60, 50, 40);
    stroke(120, 100, 70);
    strokeWeight(2);
    rect(x, y, w, h, 6);
    noStroke();

    fill(200, 168, 78);
    rect(x, y, w * value, h, 6);
  }

  drawTrackSelector(x, y, w, h) {
    this._trackSelectorRect = { x, y, w, h };
    let tracks = ['Epic Battle Music', 'Peaceful Village', 'Dark Dungeon'];
    let idx = Math.min(this.settings.musicTrack, tracks.length - 1);

    fill(60, 50, 40);
    stroke(120, 100, 70);
    strokeWeight(2);
    rect(x, y, w, h, 6);
    noStroke();

    fill(255, 230, 180);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(tracks[idx], x + w / 2, y + h / 2);
  }

  drawSettingsButton(x, y, w, h, label, action) {
    this._settingsBackBtn = { x, y, w, h, action };
    let mx = getGameMouseX();
    let my = getGameMouseY();
    let hover = mx >= x && mx <= x + w && my >= y && my <= y + h;

    fill(hover ? color(100, 80, 60) : color(55, 45, 35));
    stroke(hover ? color(220, 180, 100) : color(120, 100, 70));
    strokeWeight(2);
    rect(x, y, w, h, 8);
    noStroke();

    fill(255, 230, 180);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(label, x + w / 2, y + h / 2);
  }

  drawCloseButton(x, y, size) {
    this._settingsCloseBtn = { x, y, w: size, h: size };
    let mx = getGameMouseX();
    let my = getGameMouseY();
    let hover = mx >= x && mx <= x + size && my >= y && my <= y + size;

    fill(hover ? color(120, 60, 60) : color(80, 40, 40));
    stroke(hover ? color(255, 100, 100) : color(150, 80, 80));
    strokeWeight(2);
    rect(x, y, size, size, 6);
    noStroke();

    fill(255, 200, 200);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("✕", x + size / 2, y + size / 2);
  }

  handleSettingsClick(mx, my) {
    if (this._settingsCloseBtn) {
      let b = this._settingsCloseBtn;
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        return 'close';
      }
    }
    if (this._settingsBackBtn) {
      let b = this._settingsBackBtn;
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        return 'back';
      }
    }
    if (this._trackSelectorRect) {
      let r = this._trackSelectorRect;
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        this.settings.musicTrack = (this.settings.musicTrack + 1) % 3;
        return;
      }
    }
    if (this._sliderRects) {
      for (let id of ['music', 'brightness']) {
        let r = this._sliderRects[id];
        if (r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
          this._settingsDragTarget = id;
          let norm = (mx - r.x) / r.w;
          if (id === 'music') {
            this.settings.musicVolume = Math.max(0, Math.min(1, norm));
          } else {
            this.settings.brightness = 0.5 + norm;  // 0.5 to 1.5
          }
          this._applyInGameSettings();
          return;
        }
      }
    }
    return null;
  }

  handleSettingsDrag(mx, my) {
    if (!this._settingsDragTarget) return;
    let id = this._settingsDragTarget;
    let r = this._sliderRects && this._sliderRects[id];
    if (!r) return;

    let norm = (mx - r.x) / r.w;
    norm = Math.max(0, Math.min(1, norm));
    if (id === 'music') {
      this.settings.musicVolume = norm;
    } else {
      this.settings.brightness = 0.5 + norm;
    }
    this._applyInGameSettings();
  }

  handleSettingsRelease() {
    this._settingsDragTarget = null;
  }

  _applyInGameSettings() {
    if (select('body').length) {
      select('body').style('filter', `brightness(${Math.round(this.settings.brightness * 100)}%)`);
      select('body').style('background-color', '#000');
    }
  }

  handleTowerPanelClick(mx, my) {
    // Clicks at or below the panel top are always consumed (never place tower)
    if (my < TOWER_PANEL_TOP) return false;

    let buttons = this.towerButtons || this.getTowerPanelTabs();

    for (let btn of buttons) {
      if (mx >= btn.x && mx <= btn.x + btn.w &&
          my >= btn.y && my <= btn.y + btn.h) {
        this.game.setSelectedTowerType(btn.type);
        return true;
      }
    }
    return true; // always block map placement when click is in panel area
  }

  drawTowerPlacementPreview() {
    if (this.game.state !== GameState.PLAYING) return;
    if (!this.game.selectedTowerType) return;
    if (getGameMouseY() < HUD_HEIGHT || getGameMouseY() > TOWER_PANEL_TOP) return;

    let type = this.game.selectedTowerType;
    let cfg  = TOWER_TYPES[type] || TOWER_TYPES.basic;
    let currentGold = this.game.economy ? this.game.economy.getGold() : 0;
    let canAfford   = currentGold >= cfg.cost;
    let [r, g, b]   = cfg.color;

    // Snap mouse to grid centre (same formula as GameManager.handleClick)
    let col   = pixelToCol(getGameMouseX());
    let row   = pixelToRow(getGameMouseY());
    let gridX = colToCenterX(col);
    let gridY = rowToCenterY(row);

    // ── Buildability: use the same canBuildAt() as placement logic ──
    let tileOk = this.game.canBuildAt(col, row);
    let canPlace = tileOk && canAfford;
    let blocked  = !canPlace;

    // ── Cell highlight overlay ─────────────────────────────────────
    push();
    rectMode(CENTER);
    noStroke();
    if (canPlace) {
      fill(40, 220, 80, 55);    // green — OK to build
    } else {
      fill(220, 50, 50, 70);    // red   — blocked
    }
    rect(gridX, gridY, CURRENT_GRID_SIZE, CURRENT_GRID_SIZE, 4);

    // Red ✕ cross when blocked
    if (blocked) {
      stroke(240, 60, 60, 200);
      strokeWeight(2.5);
      let s = CURRENT_GRID_SIZE * 0.22;
      line(gridX - s, gridY - s, gridX + s, gridY + s);
      line(gridX + s, gridY - s, gridX - s, gridY + s);
    }
    pop();

    // ── Range circle ──────────────────────────────────────────────
    noFill();
    if (blocked) {
      stroke(220, 60, 60, canAfford ? 90 : 50);
    } else {
      stroke(r, g, b, 110);
    }
    strokeWeight(type === 'area' ? 2.2 : type === 'crystal' ? 2 : 1.5);
    let rangeRadius = type === 'crystal' ? (cfg.boostRadius || cfg.range) : cfg.range;
    ellipse(gridX, gridY, rangeRadius * 2, rangeRadius * 2);

    if (type === 'area') {
      stroke(blocked ? 220 : r, blocked ? 60 : g, blocked ? 60 : b, canAfford ? 55 : 25);
      strokeWeight(1);
      ellipse(gridX, gridY, (cfg.range + 10) * 2, (cfg.range + 10) * 2);
    }

    // ── Tower preview sprite (only when placement is valid) ────────
    if (!blocked) {
      let imgs = (typeof gameImages !== 'undefined') ? gameImages : {};
      const previewImgMap = { basic: imgs.towerBasic, slow: imgs.towerSlow, area: imgs.towerAreaFire, crystal: imgs.towerCrystal || imgs.towerCrystalActive, steam: imgs.towerSteam || imgs.towerSteamFire, alchemist: imgs.towerAlchemist || imgs.towerAlchemistFire };
      let previewImg = previewImgMap[type];
      if (previewImg && previewImg.width > 0) {
        tint(r, g, b, 180);
        imageMode(CENTER);
        let ps = CURRENT_GRID_SIZE - 2;
        image(previewImg, gridX, gridY, ps, ps);
        noTint();
      } else {
        noStroke();
        fill(r, g, b, 140);
        ellipse(gridX, gridY, cfg.size + 6, cfg.size + 6);
      }
    }
  }

  handleEndScreenClick(mx, my) {
    for (let button of this.endScreenButtons) {
      if (mx >= button.x && mx <= button.x + button.w &&
          my >= button.y && my <= button.y + button.h) {
        if (button.action === 'restart') this.game.restart();
        if (button.action === 'menu') this.game.returnToMenu();
        return true;
      }
    }
    return false;
  }

  _getEndStats() {
    let finalStats = this.game.finalStats || {};
    let totalWaves = finalStats.totalWaves || (this.game.waveManager ? this.game.waveManager.waves.length : 0);
    return {
      landmarkHp: finalStats.landmarkHp ?? (this.game.landmark ? Math.max(0, this.game.landmark.hp) : 0),
      landmarkMaxHp: finalStats.landmarkMaxHp ?? (this.game.landmark ? this.game.landmark.maxHp : 0),
      totalKills: finalStats.totalKills ?? this.game.totalKills,
      goldRemaining: finalStats.goldRemaining ?? (this.game.economy ? this.game.economy.getGold() : 0),
      waveSurvived: finalStats.waveSurvived ?? this.game.waveSurvived,
      totalWaves
    };
  }

  _drawEndScreenButton(button, baseColor) {
    let hovering = getGameMouseX() >= button.x && getGameMouseX() <= button.x + button.w &&
                   getGameMouseY() >= button.y && getGameMouseY() <= button.y + button.h;

    this.endScreenButtons.push(button);
    stroke(255, 235, 170);
    strokeWeight(2);
    if (hovering) {
      fill(baseColor.r + 20, baseColor.g + 20, baseColor.b + 20);
      cursor(HAND);
    } else {
      fill(baseColor.r, baseColor.g, baseColor.b);
    }
    rect(button.x, button.y, button.w, button.h, 8);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(22);
    text(button.label, button.x + button.w / 2, button.y + button.h / 2);
  }

  getEnemyImage(enemyType) {
    let imgs = (typeof gameImages !== 'undefined') ? gameImages : {};
    switch (enemyType) {
      case 'basic': return imgs.enemyGuard;
      case 'fast': return imgs.enemyPigeon;
      case 'tank': return imgs.enemyHedgehog;
      case 'knight': return imgs.monster1;
      case 'archer': return imgs.monster2;
      case 'giant': return imgs.monster3;
      case 'goblinBomber': return imgs.goblinBomber || imgs.monster1;
      case 'divingLizard': return imgs.divingLizard || imgs.monster2;
      case 'treantMage': return imgs.treantMage || imgs.monster3;
      case 'gentlemanBug': return imgs.gentlemanBug || imgs.enemyHedgehog;
      default: return null;
    }
  }

  drawEnemyCardCompact(x, y, w, h, enemyType) {
    let stats = ENEMY_STATS[enemyType];
    let info = ENEMY_INFO[enemyType];

    if (!stats || !info) return;

    push();

    // Card background
    fill(65, 55, 48);
    stroke(110, 95, 75);
    strokeWeight(2);
    rectMode(CORNER);
    rect(x, y, w, h, 6);
    noStroke();

    // Left section: Enemy image
    let imgSize = 50;
    let imgCenterX = x + 40;
    let imgCenterY = y + h / 2;

    // Image background circle
    fill(45, 40, 35);
    noStroke();
    ellipse(imgCenterX, imgCenterY, imgSize + 8, imgSize + 8);

    // Draw enemy image
    let img = this.getEnemyImage(enemyType);
    if (img && img.width > 0) {
      imageMode(CENTER);
      image(img, imgCenterX, imgCenterY, imgSize - 2, imgSize - 2);
    }

    // Right section: All text content
    let textLeftX = x + 80;  // Start text after image area
    let textRightX = x + w - 10;
    let textWidth = textRightX - textLeftX;

    // Row 1: Enemy name
    fill(255, 220, 150);
    textAlign(LEFT, TOP);
    textSize(14);
    textStyle(BOLD);
    text(info.name, textLeftX, y + 12);
    textStyle(NORMAL);

    // Row 2: Stats (HP, SPD, Reward) - all on same line
    let statsY = y + 32;
    textSize(11);

    fill(255, 110, 110);
    textAlign(LEFT, TOP);
    text("HP:" + stats.hp, textLeftX, statsY);

    fill(110, 200, 255);
    text("SPD:" + stats.speed, textLeftX + 55, statsY);

    fill(255, 215, 0);
    text("$" + stats.reward, textLeftX + 115, statsY);

    // Row 3: Ability text (below stats, within right section only)
    if (info.ability && info.ability !== 'None') {
      let abilityY = y + 52;
      fill(255, 190, 100);
      textSize(10);
      textAlign(LEFT, TOP);
      textLeading(12);
      // Constrain text to right section only
      text(info.ability, textLeftX, abilityY, textWidth - 5, h - abilityY + y - 8);
    }

    pop();
  }

  drawMonsterInfoPanel(currentLevel) {
    push();

    // Get enemies for current level
    let enemies = LEVEL_ENEMIES[currentLevel] || LEVEL_ENEMIES[1];
    let enemyCount = enemies.length;

    // Calculate panel size based on enemy count
    let cardsPerRow = 3;
    let cardW = 240;
    let cardH = 100;  // Reduced height since ability text is more compact now
    let cardGapX = 15;
    let cardGapY = 15;
    let padding = 30;

    let rows = Math.ceil(enemyCount / cardsPerRow);
    let contentW = cardsPerRow * cardW + (cardsPerRow - 1) * cardGapX;
    let contentH = rows * cardH + (rows - 1) * cardGapY;

    let panelW = contentW + padding * 2;
    let panelH = contentH + 150;

    // Minimum panel size
    panelW = Math.max(panelW, 780);
    panelH = Math.max(panelH, 400);

    // Center panel
    let panelX = (CANVAS_WIDTH - panelW) / 2;
    let panelY = (CANVAS_HEIGHT - panelH) / 2;

    // Panel background
    fill(45, 38, 32, 250);
    stroke(160, 130, 90);
    strokeWeight(4);
    rectMode(CORNER);
    rect(panelX, panelY, panelW, panelH, 12);

    // Inner border
    stroke(100, 85, 65);
    strokeWeight(2);
    rect(panelX + 8, panelY + 8, panelW - 16, panelH - 16, 10);
    noStroke();

    // Title
    fill(255, 220, 150);
    textAlign(CENTER, CENTER);
    textSize(28);
    textStyle(BOLD);
    text("ENEMY GUIDE - LEVEL " + currentLevel, CANVAS_WIDTH / 2, panelY + 40);
    textStyle(NORMAL);

    // Divider line
    stroke(120, 100, 70);
    strokeWeight(2);
    line(panelX + 25, panelY + 65, panelX + panelW - 25, panelY + 65);
    noStroke();

    // Calculate starting position for cards (centered)
    let actualContentW = Math.min(enemyCount, cardsPerRow) * cardW + (Math.min(enemyCount, cardsPerRow) - 1) * cardGapX;
    let startX = panelX + (panelW - actualContentW) / 2;
    let startY = panelY + 80;

    // Draw enemy cards
    for (let i = 0; i < enemyCount; i++) {
      let row = Math.floor(i / cardsPerRow);
      let col = i % cardsPerRow;

      // Recalculate startX for partial rows
      let enemiesInThisRow = Math.min(cardsPerRow, enemyCount - row * cardsPerRow);
      let rowContentW = enemiesInThisRow * cardW + (enemiesInThisRow - 1) * cardGapX;
      let rowStartX = panelX + (panelW - rowContentW) / 2;

      let cardX = rowStartX + col * (cardW + cardGapX);
      let cardY = startY + row * (cardH + cardGapY);

      this.drawEnemyCardCompact(cardX, cardY, cardW, cardH, enemies[i]);
    }

    // Close button - positioned below all cards
    let closeBtnW = 140;
    let closeBtnH = 42;
    let closeBtnX = CANVAS_WIDTH / 2 - closeBtnW / 2;
    let closeBtnY = panelY + panelH - 55;

    let mx = getGameMouseX();
    let my = getGameMouseY();
    let isCloseHover = mx >= closeBtnX && mx <= closeBtnX + closeBtnW &&
                       my >= closeBtnY && my <= closeBtnY + closeBtnH;

    fill(isCloseHover ? color(110, 90, 65) : color(80, 65, 50));
    stroke(160, 135, 100);
    strokeWeight(2);
    rect(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 8);

    fill(255, 240, 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);
    textStyle(BOLD);
    text("CLOSE", closeBtnX + closeBtnW / 2, closeBtnY + closeBtnH / 2);
    textStyle(NORMAL);

    this.monsterInfoCloseBtn = { x: closeBtnX, y: closeBtnY, w: closeBtnW, h: closeBtnH };

    pop();
  }
}
