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
    text("T=damage  P=pause  R=restart", 1040, 25);

    if (this.waveBonusMessage && frameCount <= this.waveBonusUntilFrame) {
      textAlign(CENTER, CENTER);
      textSize(22);
      fill(255, 230, 120);
      text(this.waveBonusMessage, CANVAS_WIDTH / 2, 78);
    }
  }

  showWaveBonus(message, durationFrames = WAVE_BONUS_DISPLAY_FRAMES) {
    this.waveBonusMessage = message;
    this.waveBonusUntilFrame = frameCount + durationFrames;
  }

  /**
   * 胜利画面
   * 引擎在 GameState.WIN 时自动调用
   * 引擎已经画了游戏画面作为背景，你只需要画遮罩和文字
   */
  drawWinScreen() {
    this.hideAll();

    fill(0, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    fill(255, 215, 0);
    textAlign(CENTER, CENTER);
    textSize(80);
    textStyle(BOLD);
    text("VICTORY!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    textSize(48);
    text("⭐ ⭐ ⭐", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 70);

    textStyle(NORMAL);
    fill(255);
    textSize(24);
    let gold = this.game.economy ? this.game.economy.getGold() : 0;
    text("Remaining Gold: " + gold, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

    if (this.game.landmark) {
      text("Landmark HP: " + this.game.landmark.hp + "/" + this.game.landmark.maxHp,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65);
    }

    fill(200);
    textSize(20);
    text("Press N → Next Level    Press R → Replay",
      CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
  }

  /**
   * 失败画面
   * 引擎在 GameState.LOSE 时自动调用
   */
  drawLoseScreen() {
    this.hideAll();

    fill(100, 0, 0, 150);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    fill(255, 50, 50);
    textAlign(CENTER, CENTER);
    textSize(80);
    textStyle(BOLD);
    text("DEFEATED!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    textStyle(NORMAL);
    textSize(32);
    fill(255, 150, 150);
    let name = this.game.landmark ? this.game.landmark.name : "Landmark";
    text(name + " has fallen...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 70);

    fill(200);
    textSize(20);
    text("Press R → Retry", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 100);
  }

  /**
   * 暂停画面
   * 引擎在 GameState.PAUSED 时自动调用
   */
  drawPauseScreen() {
    this.hideAll();

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
}
