// ========================================
// UIHUD.js — 用户界面管理器
// ========================================

class UIHUD {
  /**
   * @param {GameManager} game - 游戏引擎的引用
   * 通过 game 可以读取金币、血量、状态等数据
   */
  constructor(game) {
    this.game = game;

    // 图片资源（在 sketch.js 的 preload 中加载，然后传进来）
    this.bgImage = null;
    this.settingsBgImg = null;

    // 主菜单按钮
    this.playButton = null;
    this.settingsButton = null;
    this.exitButton = null;

    // 设置页面 UI 元素
    this.musicSlider = null;
    this.brightnessSlider = null;
    this.musicSelect = null;
    this.closeSettingsBtn = null;
    this.backBtn = null;

    // 亮度值
    this.brightnessValue = 200;

    this.waveBonusMessage = '';
    this.waveBonusUntilFrame = 0;

    this.placementMessage = '';
    this.placementMessageUntilFrame = 0;

    this.endScreenButtons = [];
    this.towerPanelTabs = [];
    this._panelLogged = false;  // print tab rects once to console
  }

  // ========================================
  // 初始化（在 sketch.js 的 setup 中调用）
  // ========================================

  setupUI() {
    this.createMenuButtons();
    this.createSettingsUI();
    this.hideAll();
  }

  createMenuButtons() {
    let buttonWidth = 220;
    let buttonHeight = 70;
    let centerX = CANVAS_WIDTH / 2 - buttonWidth / 2;
    let startY = CANVAS_HEIGHT / 2 - buttonHeight * 1.5;

    // --- Start 按钮 ---
    this.playButton = createButton('Start');
    this.playButton.position(centerX, startY);
    this.playButton.size(buttonWidth, buttonHeight);
    this.playButton.addClass('menu-button');
    this.playButton.mousePressed(() => {
      this.game.startLevel(1);
    });

    // --- Settings 按钮 ---
    this.settingsButton = createButton('Settings');
    this.settingsButton.position(centerX, startY + buttonHeight + 25);
    this.settingsButton.size(buttonWidth, buttonHeight);
    this.settingsButton.addClass('menu-button');
    this.settingsButton.mousePressed(() => {
      this.game.setState(GameState.SETTINGS);
    });

    // --- Exit 按钮 ---
    this.exitButton = createButton('Exit');
    this.exitButton.position(centerX, startY + (buttonHeight + 25) * 2);
    this.exitButton.size(buttonWidth, buttonHeight);
    this.exitButton.addClass('menu-button');
    this.exitButton.mousePressed(() => {
      window.location.href = 'about:blank';
    });
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

    // 音乐音量滑块
    this.musicSlider = createSlider(0, 1, 0.5, 0.01);

    // 音乐切换下拉菜单
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
    this.musicSelect.style('text-align-last', 'center'); // 针对下拉框收起状态
    this.musicSelect.style('box-sizing', 'border-box');
    this.musicSelect.style('appearance', 'none');
    this.musicSelect.style('-webkit-appearance', 'none');

    // 亮度滑块
    this.brightnessSlider = createSlider(10, 230, 100);

    // 关闭按钮（X 图标）
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

    // 返回按钮
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

  // ========================================
  // 绘制方法（被 GameManager 的 render() 自动调用）
  // ========================================

  /**
   * 主菜单画面
   * 引擎在 GameState.MENU 时自动调用这个方法
   */
  drawMainMenu() {
    this.endScreenButtons = [];

    // 背景图
    if (this.bgImage) {
      image(this.bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      background(20, 60, 20);
    }

    // 亮度遮罩
    this.applyBrightness();

    // 显示菜单按钮，隐藏其他
    this.hideSettingsUI();
    this.showMenuButtons();

    // 标题
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(72);
    textStyle(BOLD);
    text('Defend London', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 4.5);
    textStyle(NORMAL);
  }

  /**
   * 设置页面
   * 引擎在 GameState.SETTINGS 时自动调用
   */
  drawSettings() {
    this.endScreenButtons = [];

    // 背景
    if (this.bgImage) {
      image(this.bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      background(40, 30, 20);
    }

    this.applyBrightness();
    this.hideMenuButtons();

    // 设置面板背景图
    let imgW = 500;
    let imgH = 600;
    if (this.settingsBgImg) {
      imageMode(CENTER);
      image(this.settingsBgImg, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, imgW, imgH);
      imageMode(CORNER);
    }

    // 标题
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(32);
    textStyle(BOLD);
    text("SETTINGS", CANVAS_WIDTH / 2 + 2, CANVAS_HEIGHT / 2 - imgH / 2 + 102);
    textStyle(NORMAL);

    // 标签
    textSize(18);
    let labelX = CANVAS_WIDTH / 2 - 150;
    let startY = CANVAS_HEIGHT / 2 - 100;
    let spacing = 55;

    text("Music Volume :", labelX, startY);
    text("Switch Track :", labelX, startY + spacing);
    text("Brightness :", labelX, startY + spacing * 2);

    // 显示滑块和按钮
    this.showSettingsUI(startY, spacing);
  }

  /**
   * 游戏内 HUD（顶部信息栏）
   * 引擎在 GameState.PLAYING 时自动调用
   * 
   * 你可以自由美化这个 HUD！
   * 通过 this.game 可以获取所有游戏数据
   */
  drawHUD() {
    this.hideAll();
    this.endScreenButtons = [];
    cursor(ARROW);

    // 从引擎获取数据
    let gold = this.game.economy ? this.game.economy.getGold() : 0;
    let hp = this.game.landmark ? this.game.landmark.hp : 0;
    let maxHp = this.game.landmark ? this.game.landmark.maxHp : 0;
    let name = this.game.landmark ? this.game.landmark.name : "Landmark";
    let level = this.game.currentLevel;
    let enemies = this.game.enemies ? this.game.enemies.length : 0;

    // 半透明背景条
    fill(0, 0, 0, 180);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, 50);

    // 金币
    fill(255, 215, 0);
    textSize(20);
    textAlign(LEFT, CENTER);
    text("💰 " + gold, 20, 25);

    // 地标血量（颜色随血量变化）
    let hpPercent = maxHp > 0 ? hp / maxHp : 0;
    if (hpPercent > 0.6) fill(100, 255, 100);
    else if (hpPercent > 0.3) fill(255, 255, 100);
    else fill(255, 100, 100);
    text("🏰 " + name + ": " + hp + "/" + maxHp, 200, 25);

    // 血条
    let barX = 480;
    let barW = 120;
    fill(60);
    rect(barX, 15, barW, 20, 5);
    if (hpPercent > 0.6) fill(100, 255, 100);
    else if (hpPercent > 0.3) fill(255, 255, 100);
    else fill(255, 100, 100);
    rect(barX, 15, barW * hpPercent, 20, 5);

    // 关卡
    fill(255);
    text("Lv: " + level, 650, 25);

    // 波次信息（从 WaveManager 获取）
    let waveDisplay = '';
    let waveState   = '';
    if (this.game.waveManager) {
      waveDisplay = this.game.waveManager.getCurrentWaveDisplay(); // "Wave 1 / 3"
      waveState   = this.game.waveManager.getWaveStateText();      // "Next wave in 3s"
    }
    fill(200, 220, 255);
    text(waveDisplay, 750, 25);

    fill(180);
    textSize(13);
    text(waveState, 880, 25);

    // 操作提示
    fill(130);
    text("1/2/3 select tower  T=damage  P=pause  R=restart", 930, 25);

    if (this.waveBonusMessage && frameCount <= this.waveBonusUntilFrame) {
      textAlign(CENTER, CENTER);
      textSize(22);
      fill(255, 230, 120);
      text(this.waveBonusMessage, CANVAS_WIDTH / 2, 78);
    }

    if (this.placementMessage && frameCount <= this.placementMessageUntilFrame) {
      textAlign(CENTER, CENTER);
      textSize(18);
      fill(255, 80, 80);
      // Semi-transparent pill background
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
  }

  showWaveBonus(message, durationFrames = WAVE_BONUS_DISPLAY_FRAMES) {
    this.waveBonusMessage = message;
    this.waveBonusUntilFrame = frameCount + durationFrames;
  }

  /** Show a "Can't build here!" style placement error for ~1.5 s. */
  showPlacementError(message, durationFrames = 90) {
    this.placementMessage = message;
    this.placementMessageUntilFrame = frameCount + durationFrames;
  }

  /**
   * 胜利画面
   * 引擎在 GameState.WIN 时自动调用
   * 引擎已经画了游戏画面作为背景，你只需要画遮罩和文字
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
    text("🏆 VICTORY!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 220);

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

  /**
   * 失败画面
   * 引擎在 GameState.LOSE 时自动调用
   */
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
    text("💀 GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 220);

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

  /**
   * 暂停画面
   * 引擎在 GameState.PAUSED 时自动调用
   */
  drawPauseScreen() {
    this.hideAll();
    this.endScreenButtons = [];

    fill(0, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

  // ========================================
  // 内部辅助方法（你可以自由修改）
  // ========================================

  applyBrightness() {
    if (this.brightnessSlider) {
      this.brightnessValue = this.brightnessSlider.value();
      select('body').style('filter', `brightness(${this.brightnessValue}%)`);

      // 如果背景是白色的，调暗后会变灰，建议背景设为黑色
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
    let sliderX = CANVAS_WIDTH / 2 - 50;
    let imgW = 500;
    let imgH = 600;

    if (this.musicSlider) {
      this.musicSlider.show();
      this.musicSlider.position(sliderX, startY - 10);
    }
    if (this.musicSelect) {
      this.musicSelect.show();
      this.musicSelect.position(sliderX, startY + spacing - 10);
    }
    if (this.brightnessSlider) {
      this.brightnessSlider.show();
      this.brightnessSlider.position(sliderX, startY + spacing * 2 - 10);
    }
    if (this.closeSettingsBtn) {
      this.closeSettingsBtn.show();
      this.closeSettingsBtn.position(
        CANVAS_WIDTH / 2 - imgW / 2 + 25,
        CANVAS_HEIGHT / 2 - imgH / 2 + 25
      );
    }
    if (this.backBtn) {
      this.backBtn.show();
      this.backBtn.position(CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 100);
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

  /**
   * Calculate the clickable rect for each tower-select tab.
   * Tabs are centred on the panel, laid out with equal spacing.
   * Tab layout (vertical, top→bottom): thumbnail → name → price.
   *
   * Returned objects: { type, x, y, w, h }
   * These EXACTLY match both the visual rendering and the click detection —
   * they are computed once and shared by both drawTowerPanel() and
   * handleTowerPanelClick().
   */
  getTowerPanelTabs() {
    const BTN_W  = 130;
    const BTN_H  = 70;
    const BTN_GAP = 25;
    const totalW  = BTN_W * 3 + BTN_GAP * 2;
    const startX  = Math.floor((CANVAS_WIDTH - totalW) / 2);
    const tabY    = TOWER_PANEL_TOP + Math.floor((TOWER_PANEL_HEIGHT - BTN_H) / 2);

    return TOWER_SHORTCUT_ORDER.map((type, i) => ({
      type,
      x: startX + i * (BTN_W + BTN_GAP),
      y: tabY,
      w: BTN_W,
      h: BTN_H
    }));
  }

  drawTowerPanel() {
    let tabs = this.getTowerPanelTabs();
    this.towerPanelTabs = tabs;

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

    // ── Left side: coin icon + gold amount ───────────────────────
    let leftEdge = tabs[0].x;
    let coinCX   = Math.floor(leftEdge / 2);
    let coinCY   = panelCY;

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

    // ── Right side: England shield ───────────────────────────────
    if (imgs.englandShield && imgs.englandShield.width > 0) {
      noTint();
      imageMode(CORNER);
      let sh = PH - 12;
      let sw = sh;
      image(imgs.englandShield, CANVAS_WIDTH - sw - 8, PY + 6, sw, sh);
    }

    // ── Tower buttons ─────────────────────────────────────────────
    const thumbImgMap = {
      basic: imgs.towerBasic,
      slow:  imgs.towerSlow,
      area:  imgs.towerAreaFire
    };
    const THUMB      = 40;
    const THUMB_CX_OFF = 8 + THUMB / 2;  // px from button left edge to thumb centre

    for (let i = 0; i < tabs.length; i++) {
      let tab = tabs[i];
      let cfg = TOWER_TYPES[tab.type];
      let affordable = currentGold >= cfg.cost;
      let selected   = this.game.selectedTowerType === tab.type;
      let hovering   = mouseX >= tab.x && mouseX <= tab.x + tab.w &&
                       mouseY >= tab.y && mouseY <= tab.y + tab.h;

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

    // ── One-time console log of button bounds ─────────────────────
    if (!this._panelLogged) {
      this._panelLogged = true;
      console.log('=== Tower Panel Button Bounds ===');
      for (let tab of tabs) {
        console.log(
          `${tab.type}: x=${tab.x.toFixed(0)} y=${tab.y.toFixed(0)} ` +
          `w=${tab.w} h=${tab.h} | right=${(tab.x + tab.w).toFixed(0)} ` +
          `bottom=${(tab.y + tab.h).toFixed(0)}`
        );
      }
    }
  }

  handleTowerPanelClick(mx, my) {
    // Clicks at or below the panel top are always consumed (never place tower)
    if (my < TOWER_PANEL_TOP) return false;

    let tabs = this.getTowerPanelTabs();
    let currentGold = this.game.economy ? this.game.economy.getGold() : 0;

    for (let tab of tabs) {
      if (mx >= tab.x && mx <= tab.x + tab.w &&
          my >= tab.y && my <= tab.y + tab.h) {
        let cfg = TOWER_TYPES[tab.type];
        if (currentGold >= cfg.cost) {
          this.game.setSelectedTowerType(tab.type);
        }
        break;
      }
    }
    return true; // always block map placement when click is in panel area
  }

  drawTowerPlacementPreview() {
    if (this.game.state !== GameState.PLAYING) return;
    if (!this.game.selectedTowerType) return;
    if (mouseY < 50 || mouseY > TOWER_PANEL_TOP) return;

    let type = this.game.selectedTowerType;
    let cfg  = TOWER_TYPES[type] || TOWER_TYPES.basic;
    let currentGold = this.game.economy ? this.game.economy.getGold() : 0;
    let canAfford   = currentGold >= cfg.cost;
    let [r, g, b]   = cfg.color;

    // Snap mouse to grid centre (same formula as GameManager.handleClick)
    let col   = Math.floor(mouseX / GRID_SIZE);
    let row   = Math.floor(mouseY / GRID_SIZE);
    let gridX = col * GRID_SIZE + GRID_SIZE / 2;
    let gridY = row * GRID_SIZE + GRID_SIZE / 2;

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
    rect(gridX, gridY, GRID_SIZE, GRID_SIZE, 4);

    // Red ✕ cross when blocked
    if (blocked) {
      stroke(240, 60, 60, 200);
      strokeWeight(2.5);
      let s = GRID_SIZE * 0.22;
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
    strokeWeight(type === 'area' ? 2.2 : 1.5);
    ellipse(gridX, gridY, cfg.range * 2, cfg.range * 2);

    if (type === 'area') {
      stroke(blocked ? 220 : r, blocked ? 60 : g, blocked ? 60 : b, canAfford ? 55 : 25);
      strokeWeight(1);
      ellipse(gridX, gridY, (cfg.range + 10) * 2, (cfg.range + 10) * 2);
    }

    // ── Tower preview sprite (only when placement is valid) ────────
    if (!blocked) {
      let imgs = (typeof gameImages !== 'undefined') ? gameImages : {};
      const previewImgMap = { basic: imgs.towerBasic, slow: imgs.towerSlow, area: imgs.towerAreaFire };
      let previewImg = previewImgMap[type];
      if (previewImg && previewImg.width > 0) {
        tint(r, g, b, 180);
        imageMode(CENTER);
        let ps = GRID_SIZE - 2;
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
    let hovering = mouseX >= button.x && mouseX <= button.x + button.w &&
                   mouseY >= button.y && mouseY <= button.y + button.h;

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
}
