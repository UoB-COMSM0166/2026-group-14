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

    this.levelSelectDebug = false;

    // Tutorial debug mode
    this.tutorialDebugMode = false;
    this.tutorialDebugStep = 0;
    this.tutorialDebugClicks = [];

    this.settings = {
      musicVolume: 0.08,
      brightness: 1.0,
      musicTrack: 0
    };
    this.trackNames = ['Epic Battle Music', 'Peaceful Village', 'Dark Dungeon'];
    this.currentTrackIndex = 0;
    this._settingsDragTarget = null;  // 'music' | 'brightness' | null

    // Nickname login UI (p5 DOM)
    this.nicknameInput = null;
    this.nicknameLoginBtn = null;
    this.nicknameBackBtn = null;
    this._loginErrorMsg = '';

    // Level select extra buttons (canvas hit rects)
    this.continueButton = null;

    // Switch player button (p5 DOM)
    this.switchPlayerBtn = null;
  }

  // 获取点击了哪个主菜单按钮 (0: Start, 1: Settings, 2: Exit)
  getClickedMenuButton(mx, my) {
    const rects = this.getMenuButtonRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      // 检查鼠标是否在按钮矩形范围内
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        return i;
      }
    }
    return -1; // 没点到按钮
  }

  // 辅助函数：定义主菜单按钮的精确位置（必须和绘制时的坐标一致）
  getMenuButtonRects() {
    const BW = 225;
    const BH = 63;
    const GAP = 19;
    const startY = CANVAS_HEIGHT / 2 - 50;
    const cx = CANVAS_WIDTH / 2;
    
    return [
      { x: cx - BW / 2, y: startY, w: BW, h: BH },                   // Index 0: Start
      { x: cx - BW / 2, y: startY + BH + GAP, w: BW, h: BH },        // Index 1: Settings
      { x: cx - BW / 2, y: startY + (BH + GAP) * 2, w: BW, h: BH }   // Index 2: Exit
    ];
  }

  setupUI() {
    this.createMenuButtons();
    this.createSettingsUI();
    this.createLoginUI();
    this.createSwitchPlayerUI();
    this.hideAll();
  }

  createMenuButtons() {
    this.playButton = null;
    this.settingsButton = null;
    this.exitButton = null;
  }

  //Returns main menu button click regions for handleClick detection
  updateMusicTrack(newTrackName = null) {
    let selectedName = newTrackName || this.musicSelect.value();
    console.log("selectedName =", selectedName);
    console.log("musicTracks keys =", Object.keys(this.musicTracks));

    for (let key in this.musicTracks) {
      this.musicTracks[key].stop();
    }

    let track = this.musicTracks[selectedName];
    console.log("track =", track);

    if (track) {
      track.loop();

      let vol = this.settings ? this.settings.musicVolume : this.musicSlider.value();
      track.setVolume(vol);

      console.log("成功播放音轨:", selectedName);
    } else {
      console.error("未找到音轨:", selectedName);
    }
  }
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

    this.musicSlider = createSlider(0, 1, 0.08, 0.01);
    this.musicSlider.input(() => {
      let vol = this.musicSlider.value();
      // 遍历所有音轨更新音量（或者只更新当前播放的）
      for (let key in this.musicTracks) {
        this.musicTracks[key].setVolume(vol);
      }
    });
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
    this.musicSelect.selected('Epic Battle Music');
    this.musicSelect.changed(() => {
      this.updateMusicTrack();
    });
    this.brightnessSlider = createSlider(10, 230, 100);

    this.closeSettingsBtn = createButton('');
    this.closeSettingsBtn.style('background', "url('assets/PNG/iconCross_brown.png') no-repeat center center");
    this.closeSettingsBtn.style('background-size', 'contain');
    this.closeSettingsBtn.style('border', 'none');
    this.closeSettingsBtn.style('width', '30px');
    this.closeSettingsBtn.style('height', '30px');
    this.closeSettingsBtn.style('cursor', 'pointer');
    this.closeSettingsBtn.mousePressed(() => {
      this.game.sound.play("click");
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
      this.game.sound.play("click");
      this.game.setState(GameState.MENU);
    });
    this.backBtn.mouseOver(() => this.backBtn.style('background', '#A1887F'));
    this.backBtn.mouseOut(() => this.backBtn.style('background', '#795548'));
  }

  createLoginUI() {
    // Build once; show/hide based on GameState.LOGIN
    let uiStyle = `
        background: #5D4037;
        color: #FFECB3;
        border: 3px solid #9b7b12;
        font-family: 'Georgia', serif;
        padding: 8px 10px;
        font-size: 16px;
        border-radius: 8px;
        outline: none;
      `;

    this.nicknameInput = createInput('');
    this.nicknameInput.attribute('placeholder', 'Enter nickname (1-20 chars)');
    this.nicknameInput.style(uiStyle);
    this.nicknameInput.style('width', '280px');

    this.nicknameLoginBtn = createButton('Login');
    this.nicknameLoginBtn.style(uiStyle);
    this.nicknameLoginBtn.style('cursor', 'pointer');
    this.nicknameLoginBtn.mousePressed(() => {
      if (typeof ensureAudioStarted === 'function') ensureAudioStarted();
      if (this.game && this.game.sound && typeof this.game.sound.play === 'function') this.game.sound.play('click1');
      let nick = this.nicknameInput ? this.nicknameInput.value() : '';
      let ok = this.game.login(nick);
      if (!ok) {
        this._loginErrorMsg = 'Invalid nickname. Please use 1-20 characters.';
        return;
      }
      this._loginErrorMsg = '';
      this.game.setState(GameState.LEVEL_SELECT);
    });

    this.nicknameBackBtn = createButton('Back');
    this.nicknameBackBtn.style(uiStyle);
    this.nicknameBackBtn.style('cursor', 'pointer');
    this.nicknameBackBtn.mousePressed(() => {
      if (this.game && this.game.sound && typeof this.game.sound.play === 'function') this.game.sound.play('click1');
      this._loginErrorMsg = '';
      this.game.setState(GameState.MENU);
    });
  }

  createSwitchPlayerUI() {
    let uiStyle = `
        background: #5D4037;
        color: #FFECB3;
        border: 2px solid #9b7b12;
        font-family: 'Georgia', serif;
        padding: 6px 10px;
        font-size: 14px;
        border-radius: 8px;
      `;
    this.switchPlayerBtn = createButton('Switch Player');
    this.switchPlayerBtn.style(uiStyle);
    this.switchPlayerBtn.style('cursor', 'pointer');
    this.switchPlayerBtn.mousePressed(() => {
      if (this.game && this.game.sound && typeof this.game.sound.play === 'function') this.game.sound.play('click1');
      if (this.game && typeof this.game.logout === 'function') this.game.logout();
      this._loginErrorMsg = '';
      this.game.setState(GameState.LOGIN);
    });
  }

  showSwitchPlayerUI() {
    if (this.switchPlayerBtn) {
      this.switchPlayerBtn.show();
      this.switchPlayerBtn.style('z-index', '1000');
    }
  }

  hideSwitchPlayerUI() {
    if (this.switchPlayerBtn) this.switchPlayerBtn.hide();
  }

 getDomX(designX) {
    let cnv = document.querySelector('canvas');
    if (!cnv) return designX;
    let cnvRect = cnv.getBoundingClientRect(); // 使用 cnvRect 变量名
    let scale = cnvRect.width / DESIGN_WIDTH;
    return cnvRect.left + (designX * scale);
  }

  getDomY(designY) {
    let cnv = document.querySelector('canvas');
    if (!cnv) return designY;
    let cnvRect = cnv.getBoundingClientRect();
    let scale = cnvRect.height / DESIGN_HEIGHT;
    return cnvRect.top + (designY * scale);
  }
  showLoginUI() {
    if (this.nicknameInput) this.nicknameInput.show();
    if (this.nicknameLoginBtn) this.nicknameLoginBtn.show();
    if (this.nicknameBackBtn) this.nicknameBackBtn.show();
  }

  hideLoginUI() {
    if (this.nicknameInput) this.nicknameInput.hide();
    if (this.nicknameLoginBtn) this.nicknameLoginBtn.hide();
    if (this.nicknameBackBtn) this.nicknameBackBtn.hide();
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
    this.hideLoginUI();
    this.hideSwitchPlayerUI();

    this.drawMenuButtons();
    this.drawPlayerBadge();

   // UIHUD.js -> drawMainMenu() 内部逻辑

  if (this.game && typeof this.game.isLoggedIn === 'function' && this.game.isLoggedIn()) {
    this.showSwitchPlayerUI();
  
 
    let cnv = document.querySelector('canvas');
    let rect = cnv ? cnv.getBoundingClientRect() : { width: DESIGN_WIDTH };
    let scale = rect.width / DESIGN_WIDTH;

 
    this.switchPlayerBtn.position(this.getDomX(453), this.getDomY(25)); 
  
  
    this.switchPlayerBtn.size(220 * scale, 55 * scale);
  

    this.switchPlayerBtn.style('font-size', (24 * scale) + 'px');
    this.switchPlayerBtn.style('font-weight', 'bold');
  
    this.switchPlayerBtn.style('padding', (5 * scale) + 'px');
  }
  }

  drawPlayerBadge() {
    let nick = this.game && this.game.playerNickname ? this.game.playerNickname : '';
    let isLoggedIn = !!nick;

    push();
    rectMode(CORNER);
    noStroke();
    fill(0, 0, 0, 150);
    rect(18, 18, 420, 62, 10);

    fill(255, 220, 150);
    textAlign(LEFT, CENTER);
    textSize(22);
    textStyle(BOLD);
    text(isLoggedIn ? `Player: ${nick}` : 'Player: (not logged in)', 30, 44);
    textStyle(NORMAL);

    fill(220, 220, 220, 220);
    textSize(15);
    let hint = isLoggedIn ? `Unlocked: 1-${this.game.getUnlockedUpTo()}` : 'Click Start to login and save progress';
    text(hint, 30, 66);
    pop();
  }

  //Draw main menu buttons (image or fallback text)

  drawMenuButtons() {
    const BW = 225;
    const BH = 63;
    const GAP = 19;
    const startY = CANVAS_HEIGHT / 2 - 50;
    const cx = CANVAS_WIDTH / 2;

    const imgs = typeof gameImages !== 'undefined' ? gameImages : {};
    const useImages = imgs.btnStart && imgs.btnStart.width > 0;

    const centerYs = [
      startY + BH / 2,
      startY + BH + GAP + BH / 2,
      startY + (BH + GAP) * 2 + BH / 2
    ];

    const rectData = this.getMenuButtonRects();

    for (let i = 0; i < 3; i++) {
      const cy = centerYs[i];
      const bRect = rectData[i]; // 将变量名 rect 改为 bRect
      const hovered = getGameMouseX() >= bRect.x && getGameMouseX() <= bRect.x + bRect.w &&
                      getGameMouseY() >= bRect.y && getGameMouseY() <= bRect.y + bRect.h;

      let scaleFactor = hovered ? 1.08 : 1.0;
      if (hovered && mouseIsPressed) scaleFactor = 0.95;

      push();
      translate(cx, cy);
      scale(scaleFactor);
      translate(-cx, -cy);

      if (useImages) {
        const img = i === 0 ? imgs.btnStart : (i === 1 ? imgs.btnSettings : imgs.btnExit);
        imageMode(CENTER);
        image(img, cx, cy, BW, BH);
      } else {
        noStroke();
        fill(60, 50, 40, 230);
        rect(bRect.x, bRect.y, bRect.w, bRect.h, 12); // 使用修正后的 bRect 变量
        stroke(180, 160, 120);
        strokeWeight(2);
        noFill();
        rect(bRect.x, bRect.y, bRect.w, bRect.h, 12);
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(26);
        textStyle(BOLD);
        const labels = ['Start', 'Settings', 'Exit'];
        text(labels[i], cx, cy);
      }
      pop();
      if (hovered) cursor(HAND);
    }
  }

  //Level select - called when GameState.LEVEL_SELECT

  drawLevelSelect() {
    push();

    // 1. 强制隐藏登录 UI 和切换玩家按钮
    this.hideLoginUI();
    this.hideSwitchPlayerUI();

    // 2. 渲染背景图
    if (typeof gameImages !== 'undefined' && gameImages.levelSelectBg && gameImages.levelSelectBg.width > 0) {
      image(gameImages.levelSelectBg, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    } else {
      background(40, 35, 30);
    }

    // 3. 定义鼠标坐标变量（这是关键！即使删了返回键，后面的 Continue 键也要用）
    let mx = typeof getGameMouseX === 'function' ? getGameMouseX() : mouseX;
    let my = typeof getGameMouseY === 'function' ? getGameMouseY() : mouseY;

    // 4. 定义关卡按钮及其状态
    this.levelButtons = [
      { level: 1, x: 409, y: 457, width: 160, height: 150, unlocked: true, name: "THE OUTER DEFENSES" },
      { level: 2, x: 1067, y: 526, width: 162, height: 156, unlocked: true, name: "RIVER THAMES PATROL" },
      { level: 3, x: 1566, y: 282, width: 300, height: 189, unlocked: true, name: "TOWER OF LONDON SIEGE" }
    ];

    let unlockedUpTo = (this.game && this.game.getUnlockedUpTo) ? this.game.getUnlockedUpTo() : 1;
    for (let btn of this.levelButtons) {
      btn.unlocked = btn.level <= unlockedUpTo;

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
        fill(0);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(36);
        text("🔒 Locked", btn.x, btn.y);
        textStyle(NORMAL);
      }
    }

    // 5. 渲染 Continue 按钮（它依赖上面的 mx 和 my）
    let canContinue = this.game && typeof this.game.hasRunSave === 'function' ? this.game.hasRunSave() : false;
    let contW = 220;
    let contH = 48;
    let contX = CANVAS_WIDTH - contW - 28;
    let contY = CANVAS_HEIGHT - contH - 28;
    this.continueButton = { x: contX, y: contY, w: contW, h: contH, enabled: canContinue };

    let contHover = mx >= contX && mx <= contX + contW && my >= contY && my <= contY + contH;
    fill(contHover ? color(80, 60, 40, 230) : color(50, 40, 30, 204));
    stroke(contHover ? '#FFD700' : '#C8A84E');
    strokeWeight(2);
    rectMode(CORNER);
    rect(contX, contY, contW, contH, 10);
    noStroke();

    fill(canContinue ? color(255, 220, 150) : color(170, 170, 170));
    textAlign(CENTER, CENTER);
    textSize(27);
    text("Continue", contX + contW / 2, contY + contH / 2);
  
    pop();
    this.drawLevelSelectDebugGrid();
  }

  drawLevelSelectDebugGrid() {
    if (!this.levelSelectDebug) return;

    push();

    let gridSize = 50;  // 50px grid
    let mx = getGameMouseX();
    let my = getGameMouseY();

    // Draw vertical lines
    stroke(255, 255, 255, 40);
    strokeWeight(1);
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
      // Highlight every 100px
      if (x % 100 === 0) {
        stroke(255, 255, 0, 80);
        strokeWeight(2);
      } else {
        stroke(255, 255, 255, 40);
        strokeWeight(1);
      }
      line(x, 0, x, CANVAS_HEIGHT);

      // X coordinate label
      if (x % 100 === 0) {
        fill(255, 255, 0, 200);
        noStroke();
        textSize(20);
        textAlign(CENTER, TOP);
        text(x, x, 5);
      }
    }

    // Draw horizontal lines
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
      if (y % 100 === 0) {
        stroke(255, 255, 0, 80);
        strokeWeight(2);
      } else {
        stroke(255, 255, 255, 40);
        strokeWeight(1);
      }
      line(0, y, CANVAS_WIDTH, y);

      // Y coordinate label
      if (y % 100 === 0) {
        fill(255, 255, 0, 200);
        noStroke();
        textSize(20);
        textAlign(LEFT, CENTER);
        text(y, 5, y);
      }
    }

    // Draw crosshair at mouse position
    stroke(255, 0, 255);
    strokeWeight(2);
    line(mx - 30, my, mx + 30, my);
    line(mx, my - 30, mx, my + 30);

    // Draw mouse coordinate info box
    let infoW = 200;
    let infoH = 80;
    let infoX = 10;
    let infoY = CANVAS_HEIGHT - infoH - 10;

    fill(0, 0, 0, 220);
    stroke(255, 255, 0);
    strokeWeight(2);
    rectMode(CORNER);
    rect(infoX, infoY, infoW, infoH, 5);

    fill(255, 255, 0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(28);
    textStyle(BOLD);
    text("DEBUG MODE", infoX + 10, infoY + 10);
    textStyle(NORMAL);

    fill(255);
    textSize(24);
    text("Mouse X: " + Math.round(mx), infoX + 10, infoY + 32);
    text("Mouse Y: " + Math.round(my), infoX + 10, infoY + 48);

    fill(150, 150, 150);
    textSize(20);
    text("Press G to toggle grid", infoX + 10, infoY + 65);

    // Show click position helper
    fill(255, 100, 255);
    textAlign(LEFT, BOTTOM);
    textSize(11);
    text("Click position: (" + Math.round(mx) + ", " + Math.round(my) + ")", mx + 15, my - 5);

    pop();
  }

  /**
   * Handle main menu click, return true if handled
   */

  handleMenuClick(mx, my) {
    const rects = this.getMenuButtonRects();
    for (const r of rects) {
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        this.game.sound.play("click");
        if (r.action === 'start') {
          if (!this.game.isLoggedIn()) this.game.setState(GameState.LOGIN);
          else this.game.setState(GameState.LEVEL_SELECT);
        }
        else if (r.action === 'settings') this.game.setState(GameState.SETTINGS);
        else if (r.action === 'exit') window.location.href = 'about:blank';
        return true;
      }
    }
    return false;
  }

  drawLoginScreen() {
    this.hideMenuButtons();
    this.hideSettingsUI();
    this.hideSwitchPlayerUI();

    let cnv = document.querySelector('canvas');
    let cnvRect = cnv ? cnv.getBoundingClientRect() : { width: DESIGN_WIDTH, height: DESIGN_HEIGHT };
    let scale = cnvRect.width / DESIGN_WIDTH;

    if (typeof gameImages !== 'undefined' && gameImages.mainBackground && gameImages.mainBackground.width > 0) {
      image(gameImages.mainBackground, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      background(25, 20, 18);
    }

    let panelW = 640;
    let panelH = 440; 
    let panelX = CANVAS_WIDTH / 2 - panelW / 2;
    let panelY = CANVAS_HEIGHT / 2 - panelH / 2;

    
    fill(60, 45, 30, 250); 
    stroke(200, 168, 78);
    strokeWeight(5);
    rect(panelX, panelY, panelW, panelH, 15);

    // --- 核心设置：完全同步按钮文字风格 ---
    textFont('Georgia'); // 使用与按钮一致的 Georgia 字体
    textStyle(NORMAL);   // 强制使用常规粗细，不要加粗
    noStroke();          // 必须取消描边，否则文字会显得粗大模糊

    // 1. 主标题
    fill(255, 215, 100);
    textAlign(CENTER, CENTER);
    textSize(50);
    text('Nickname Login', CANVAS_WIDTH / 2, panelY + 70);

    // 2. 说明文字（使用按钮的文字颜色 #FFECB3）
    fill(255, 236, 179); // 对应 HTML 颜色 #FFECB3
    textSize(20);
    text('Your progress will be saved to this name.', CANVAS_WIDTH / 2, panelY + 120);

    // 3. 错误信息
    if (this._loginErrorMsg) {
      fill(255, 120, 120);
      textSize(20);
      text("⚠️ " + this._loginErrorMsg, CANVAS_WIDTH / 2, panelY + 155);
    }

    // 4. NICKNAME 标签（同样使用 #FFECB3）
    fill(255, 236, 179); 
    textSize(24);
    text('NICKNAME:', CANVAS_WIDTH / 2, panelY + 195);

    let inputW = 340;
    let inputH = 48;
    let btnW = 140;
    let btnH = 55;
    let btnGap = 60; 

    this.showLoginUI();

    if (this.nicknameInput) {
      this.nicknameInput.size(inputW * scale, inputH * scale);
      this.nicknameInput.position(this.getDomX(CANVAS_WIDTH / 2 - inputW / 2), this.getDomY(panelY + 230));
      this.nicknameInput.style('font-size', (22 * scale) + 'px');
      this.nicknameInput.style('text-align', 'center');
      this.nicknameInput.style('font-family', "'Georgia', serif");
      this.nicknameInput.style('font-weight', 'normal'); // 确保输入框也不加粗
    }

    let totalBtnAreaW = (btnW * 2) + btnGap;
    let btnStartX = CANVAS_WIDTH / 2 - totalBtnAreaW / 2;
    let btnY = panelY + 330;

    // 更新 DOM 按钮样式，确保万无一失
    if (this.nicknameLoginBtn) {
      this.nicknameLoginBtn.size(btnW * scale, btnH * scale);
      this.nicknameLoginBtn.position(this.getDomX(btnStartX), this.getDomY(btnY));
      this.nicknameLoginBtn.style('font-size', (20 * scale) + 'px');
      this.nicknameLoginBtn.style('font-weight', 'normal'); 
      this.nicknameLoginBtn.style('font-family', "'Georgia', serif");
    }

    if (this.nicknameBackBtn) {
      this.nicknameBackBtn.size(btnW * scale, btnH * scale);
      this.nicknameBackBtn.position(this.getDomX(btnStartX + btnW + btnGap), this.getDomY(btnY));
      this.nicknameBackBtn.style('font-size', (20 * scale) + 'px');
      this.nicknameBackBtn.style('font-weight', 'normal');
      this.nicknameBackBtn.style('font-family', "'Georgia', serif");
    }
    
    pop();
  }

  handleLoginClick(mx, my) {
    // DOM buttons handle the interactions.
    return false;
  }

  /**
   * Settings page - called when GameState.SETTINGS
   */
  drawSettings() {
    this.hideMenuButtons();
    this.hideLoginUI();
    this.hideSwitchPlayerUI();
    push();
    // 渲染背景
    if (this.bgImage) {
      image(this.bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      background(40, 30, 20);
    }

    // 计算布局坐标 (与 In-Game 保持一致)
    let startY = CANVAS_HEIGHT / 2 - 100;
    let spacing = 85;

    // 这里的文字提示 (Music Volume 等) 也要用 Canvas 画
    // ... 你的文字代码 ...

    // 调用上面改好的函数
    this.showSettingsUI();

    // 最后渲染亮度罩子 (确保覆盖全屏)
    this.applyBrightness();
    pop();
  }

  /**
   * Draw top HUD bar (45px)
   * @param {boolean} showPaused - Show PAUSED in centre
   */
  // UIHUD.js
  drawTopHUDBar(showPaused = false) {
    const H = HUD_HEIGHT; // 假设已在 constants.js 中改为 75
    const leftX = 15;

    // 绘制背景
    noStroke();
    fill(30, 25, 18, 224);
    rectMode(CORNER);
    rect(0, 0, CANVAS_WIDTH, H);

    // 底部装饰线
    stroke(200, 168, 78);
    strokeWeight(2);
    line(0, H, CANVAS_WIDTH, H);
    noStroke();

    let hp = this.game.landmark ? Math.floor(this.game.landmark.hp) : 0;
    let maxHp = this.game.landmark ? Math.floor(this.game.landmark.maxHp) : 0;
    let name = this.game.landmark ? this.game.landmark.name : 'Landmark';
    let hpPercent = maxHp > 0 ? hp / maxHp : 0;

    let centerX = CANVAS_WIDTH / 2;
    let barW = 200; // 稍微加宽血条
    let barH = 16;  // 稍微加高血条
    let barX = centerX - barW / 2;
    
    // --- 垂直排版优化 ---
    let nameY = 22; // 标题位置
    let barY = 46; // 血条位置，与标题拉开间距

    // 绘制地标名称
    fill(255, 255, 255, 220);
    textAlign(CENTER, CENTER);
    textSize(28);
    textStyle(BOLD);
    text(name, centerX, nameY);

    // 绘制血条
    fill(60, 60, 60, 204);
    rect(barX, barY, barW, barH, 8);

    if (hpPercent > 0.6) fill(76, 175, 80);
    else if (hpPercent > 0.3) fill(255, 193, 7);
    else fill(244, 67, 54);
    
    rect(barX, barY, barW * hpPercent, barH, 8);

    // 血条数值居中
    let hpText = `${hp} / ${maxHp}`;
    textSize(16);
    fill(255);
    text(hpText, centerX, barY + barH / 2);
    textStyle(NORMAL);

    // --- 右侧波次信息优化 ---
    let rightEdge = CANVAS_WIDTH - 25;
    let currWave = 1, totalWaves = 1;
    if (this.game.waveManager) {
        currWave = Math.min(this.game.waveManager.currentWaveIndex + 1, this.game.waveManager.waves.length);
        totalWaves = this.game.waveManager.waves.length;
    }

    fill(255, 255, 255, 200);
    textSize(22);
    textAlign(RIGHT, CENTER);
    text('Wave', rightEdge, nameY);

    textSize(34);
    textStyle(BOLD);
    let suffix = ' / ' + totalWaves;
    fill(255);
    text(suffix, rightEdge, barY + barH / 2);
    fill(255, 215, 0);
    text(currWave, rightEdge - textWidth(suffix), barY + barH / 2);
    textStyle(NORMAL);
  }

  //In-game HUD - called when GameState.PLAYING

  drawHUD() {
    this.hideAll();
    this.endScreenButtons = [];
    cursor(ARROW);
    this.drawTopHUDBar(false);
    let inGameBackX = 160;
    let inGameBackW = 160;
    let inGameBackH = 40; 
    let inGameBackY = (HUD_HEIGHT - inGameBackH) / 2; 
    
    let mx = getGameMouseX();
    let my = getGameMouseY();
    let isInGameBackHover = mx >= inGameBackX && mx <= inGameBackX + inGameBackW && my >= inGameBackY && my <= inGameBackY + inGameBackH;

    fill(100, 80, 60); 
    stroke(220, 180, 100); 
    strokeWeight(3); 
    rectMode(CORNER);
    rect(inGameBackX, inGameBackY, inGameBackW, inGameBackH, 8);

    
    noStroke();
    fill(255, 230, 180); 
    textAlign(CENTER, CENTER);
    textSize(20); 
    textStyle(BOLD);
    text('Main Menu', inGameBackX + inGameBackW / 2, inGameBackY + inGameBackH / 2);
    textStyle(NORMAL);

    this.inGameBackBtn = { x: inGameBackX, y: inGameBackY, w: inGameBackW, h: inGameBackH };

    this.hideSwitchPlayerUI();

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
    textSize(45);
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

  showSettingsUI() {
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
    this.handleSliderInteraction();
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
    this.hideLoginUI();
  }

  //Calculate the clickable rect for each tower-select tab.
  //Dynamic layout based on available towers per level.
  //Returned objects: { type, x, y, w, h }

 getTowerPanelTabs() {
    const availableTowers = (this.game && this.game.availableTowers) || LEVEL_AVAILABLE_TOWERS[1];
   
    const BTN_W = 180; 
    const BTN_H = 90;
    const BTN_GAP = 14; 
    
    
    const startX = 550;

    const tabY = TOWER_PANEL_TOP + Math.floor((TOWER_PANEL_HEIGHT - BTN_H) / 2);

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

    // ── 背景绘制 ──
    noStroke();
    fill(40, 30, 20, 235);
    rectMode(CORNER);
    rect(0, PY, CANVAS_WIDTH, PH);

    stroke(200, 168, 78, 220);
    strokeWeight(3); // 加粗分割线
    line(0, PY, CANVAS_WIDTH, PY);
    noStroke();

    let currentGold = this.game.economy ? this.game.economy.getGold() : 0;

    // ── 左侧功能按钮区 (尺寸从65x70放大到95x95) ──
    let btnStartX = 25; // 起始向右挪一点
    let btnY = PY + 10;
    let btnW = 95;      // 宽度增加
    let btnH = PH - 20; // 高度增加
    let btnGap = 12;    // 间距微调

    let mx = getGameMouseX();
    let my = getGameMouseY();

    // --- Settings 按钮 ---
    let settingsBtnX = btnStartX;
    let isSettingsHover = mx >= settingsBtnX && mx <= settingsBtnX + btnW && my >= btnY && my <= btnY + btnH;
    fill(isSettingsHover ? color(100, 80, 60) : color(55, 45, 35));
    stroke(isSettingsHover ? color(220, 180, 100) : color(120, 100, 70));
    strokeWeight(2);
    rect(settingsBtnX, btnY, btnW, btnH, 8);

    fill(isSettingsHover ? color(255, 230, 180) : color(180, 160, 120));
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(40); // 字母图标放大
    text("S", settingsBtnX + btnW / 2, btnY + btnH / 2 - 8);
    textSize(20); // 文字标签放大
    text("Settings", settingsBtnX + btnW / 2, btnY + btnH / 2 + 22);
    this.inGameSettingsBtn = { x: settingsBtnX, y: btnY, w: btnW, h: btnH };

    // --- Pause/Resume 按钮 ---
    let pauseBtnX = settingsBtnX + btnW + btnGap;
    let isPauseHover = mx >= pauseBtnX && mx <= pauseBtnX + btnW && my >= btnY && my <= btnY + btnH;
    let isPaused = (typeof game !== 'undefined' && game.manualPaused);
    fill(isPauseHover ? color(100, 80, 60) : color(55, 45, 35));
    stroke(isPauseHover ? color(220, 180, 100) : color(120, 100, 70));
    strokeWeight(2);
    rect(pauseBtnX, btnY, btnW, btnH, 8);
  // --- Pause/Resume 按钮内部 ---
    fill(isPauseHover ? color(255, 230, 180) : color(180, 160, 120));
    noStroke();
    textAlign(CENTER, CENTER);

    if (isPaused) {
    textSize(60); // 播放按钮 ">" 可以稍微大一点
    text(">", pauseBtnX + btnW / 2, btnY + btnH / 2 - 8);
    } else {
    // 关键改动：减小字号并加粗，消除“长条感”
    textStyle(BOLD); 
    textSize(32); // 从 50 降到 32，让它变短
    text("| |", pauseBtnX + btnW / 2, btnY + btnH / 2 - 10);
    textStyle(NORMAL); // 恢复普通样式给下面的文字用
    }

    textSize(20); 
    text(isPaused ? "Resume" : "Pause", pauseBtnX + btnW / 2, btnY + btnH / 2 + 25);
    this.pauseBtn = { x: pauseBtnX, y: btnY, w: btnW, h: btnH };

    // --- Monster Info 按钮 ---
    let monsterBtnX = pauseBtnX + btnW + btnGap;
    let isMonsterHover = mx >= monsterBtnX && mx <= monsterBtnX + btnW && my >= btnY && my <= btnY + btnH;
    fill(isMonsterHover ? color(100, 80, 60) : color(55, 45, 35));
    stroke(isMonsterHover ? color(220, 180, 100) : color(120, 100, 70));
    strokeWeight(2);
    rect(monsterBtnX, btnY, btnW, btnH, 8);
    let monsterIcon = this.getEnemyImage('basic');
    if (monsterIcon && monsterIcon.width > 0) {
      imageMode(CENTER);
      let iconSize = 45; // 怪物图标放大
      image(monsterIcon, monsterBtnX + btnW / 2, btnY + btnH / 2 - 5, iconSize, iconSize);
    }
    fill(isMonsterHover ? color(255, 230, 180) : color(180, 160, 120));
    noStroke();
    textSize(14); // "Enemies" 文字放大
    text("Enemies", monsterBtnX + btnW / 2, btnY + btnH - 12);
    this.monsterInfoBtn = { x: monsterBtnX, y: btnY, w: btnW, h: btnH };

    // --- 金币与数值 (右移并放大) ---
    let coinStartX = monsterBtnX + btnW + btnGap + 40;
    let coinCX = coinStartX + 50;
    let coinCY = panelCY;

    fill(255, 210, 0);
    ellipse(coinCX - 30, coinCY, 36, 36); // 金币圆圈放大
    fill(180, 130, 0);
    textAlign(CENTER, CENTER);
    textSize(18);
    textStyle(BOLD);
    text('$', coinCX - 30, coinCY);
    textStyle(NORMAL);

    fill(255, 225, 70);
    textAlign(LEFT, CENTER);
    textSize(28); // 金钱数值字号放大
    textStyle(BOLD);
    text(currentGold, coinCX + 5, coinCY);
    textStyle(NORMAL);

    // ── 塔防选择卡片渲染 (尺寸依赖 getTowerPanelTabs 的新设置) ──
    const thumbImgMap = {
      basic: imgs.towerBasic,
      slow: imgs.towerSlow,
      area: imgs.towerAreaFire,
      crystal: imgs.towerCrystal || imgs.towerCrystalActive,
      steam: imgs.towerSteam || imgs.towerSteamFire,
      alchemist: imgs.towerAlchemist || imgs.towerAlchemistFire
    };
    const THUMB = 60; // 图标尺寸从40放大到60
    const THUMB_CX_OFF = 12 + THUMB / 2;

    for (let i = 0; i < tabs.length; i++) {
      let tab = tabs[i];
      let cfg = TOWER_TYPES[tab.type];
      let affordable = currentGold >= cfg.cost;
      let selected = this.game.selectedTowerType === tab.type;
      let hovering = getGameMouseX() >= tab.x && getGameMouseX() <= tab.x + tab.w && getGameMouseY() >= tab.y && getGameMouseY() <= tab.y + tab.h;

      if (hovering) this.hoveredTower = tab.type;

      rectMode(CORNER);
      if (selected) {
        fill(85, 68, 40, 240);
        stroke(255, 215, 0); // 选中时边框更亮
        strokeWeight(3);
      } else if (hovering && affordable) {
        fill(68, 56, 36, 225);
        stroke(200, 170, 80, 210);
        strokeWeight(2);
      } else {
        fill(60, 50, 35, 210);
        stroke(100, 80, 40, 150);
        strokeWeight(1);
      }
      rect(tab.x, tab.y, tab.w, tab.h, 10);
      noStroke();

      let thumbCX = tab.x + THUMB_CX_OFF;
      let thumbCY = tab.y + tab.h / 2;
      let thumb = thumbImgMap[tab.type];

      if (thumb && thumb.width > 0) {
        tint(255, affordable ? 255 : 100);
        imageMode(CENTER);
        image(thumb, thumbCX, thumbCY, THUMB, THUMB);
        noTint();
      }

      // 文字区域：根据大卡片重新定位
      let textX = tab.x + THUMB_CX_OFF + THUMB / 2 + 12;
      let nameY = tab.y + tab.h / 2 - 12;
      let priceY = tab.y + tab.h / 2 + 15;

      fill(255, 255, 255, affordable ? 240 : 130);
      textAlign(LEFT, CENTER);
      textSize(18); // 塔名放大
      textStyle(BOLD);
      text(cfg.name.split(' ')[0], textX, nameY);
      textStyle(NORMAL);

      fill(255, 215, 0, affordable ? 255 : 110);
      textSize(16); // 价格放大
      text(`$${cfg.cost}`, textX, priceY);

      // 快捷键提示
      fill(160, 140, 80, affordable ? 200 : 90);
      textAlign(RIGHT, TOP);
      textSize(13);
      text(`[${i + 1}]`, tab.x + tab.w - 8, tab.y + 6);

      if (!affordable) {
        fill(0, 0, 0, 140);
        rect(tab.x, tab.y, tab.w, tab.h, 10);
      }
      if (hovering && affordable) cursor(HAND);
    }

    if (this.hoveredTower) {
      this.drawTowerTooltip(this.hoveredTower, getGameMouseX(), getGameMouseY());
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

  handleSliderInteraction() {
    let mx = getGameMouseX();
    let my = getGameMouseY();

    if (mouseIsPressed) {
      if (!this._wasPressed) {
        this._wasPressed = true; // 锁定，防止连点

        // --- 专门处理音轨点击 ---
        let tr = this._sliderRects['track'];
        if (tr && mx > tr.x && mx < tr.x + tr.w &&
          my > tr.y && my < tr.y + tr.h) {
          console.log("切换音轨按钮被点击");
          this.handleTrackSwitch();
          return; // 触发后直接返回，避免干扰滑块
        }
      }

      // --- 处理滑块滑动 ---
      for (let id in this._sliderRects) {
        if (id === 'track') continue; // 跳过按钮

        let r = this._sliderRects[id];
        if (mx > r.x && mx < r.x + r.w &&
          my > r.y - 10 && my < r.y + r.h + 10) {

          let newValue = constrain((mx - r.x) / r.w, 0, 1);

          if (id === 'music') {
            this.settings.musicVolume = newValue;
            this.updateGlobalMusicVolume(newValue);
          } else if (id === 'brightness') {
            this.settings.brightness = map(newValue, 0, 1, 0.5, 1.5);
          }
        }
      }
    } else {
      this._wasPressed = false;
    }
  }
  updateGlobalMusicVolume(vol) {
    // 遍历所有音轨并设置音量
    for (let key in this.musicTracks) {
      this.musicTracks[key].setVolume(vol);
    }
  }
  renderBrightnessOverlay() {
    let b = this.settings.brightness;

    // 只有当亮度不等于 1.0 时才渲染，节省性能
    if (Math.abs(b - 1.0) < 0.01) return;

    push(); // 开启独立绘图状态，防止污染其他 UI
    resetMatrix(); // 关键：重置所有 translate/scale，确保从 (0,0) 开始覆盖全屏

    if (b < 1.0) {
      // 变暗：盖黑色半透明 (映射 0.5->1.0 为 200->0 透明度)
      let alpha = map(b, 0.5, 1.0, 200, 0);
      fill(0, 0, 0, alpha);
    } else {
      // 变亮：盖白色半透明 (映射 1.0->1.5 为 0->100 透明度)
      let alpha = map(b, 1.0, 1.5, 0, 100);
      fill(255, 255, 255, alpha);
    }

    noStroke();
    rectMode(CORNER);
    // 使用 width 和 height 确保覆盖当前画布所有可见区域
    rect(0, 0, width, height);

    pop();
  }
  handleTrackSwitch() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.trackNames.length;

    // 同步给 settings，确保 drawTrackSelector 里的文字会变
    this.settings.musicTrack = this.currentTrackIndex;

    let newName = this.trackNames[this.currentTrackIndex];
    this.updateMusicTrack(newName);

    if (this.musicSelect) {
      this.musicSelect.selected(newName);
    }
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
    this.handleSliderInteraction();
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
    this._sliderRects = this._sliderRects || {};
    this._sliderRects['track'] = { x, y, w, h };
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
    text(this.trackNames[idx], x + w / 2, y + h / 2);
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
        this.game.sound.play("click");
        return 'close';
      }
    }
    if (this._settingsBackBtn) {
      let b = this._settingsBackBtn;
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        this.game.sound.play("click");
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
        this.game.sound.play("click1");
        this.game.setSelectedTowerType(btn.type);
        return true;
      }
    }
    return true; // always block map placement when click is in panel area
  }

  drawTowerPlacementPreview() {
    // 1. 基础状态检查
    if (this.game.state !== GameState.PLAYING) return;
    if (!this.game.selectedTowerType) return;
    
    // 2. 检查鼠标是否在可放置的垂直区域内（顶栏和底栏之间）
    let mx = getGameMouseX();
    let my = getGameMouseY();
    if (my < HUD_HEIGHT || my > TOWER_PANEL_TOP) return;

    // 3. 获取当前塔的配置
    let type = this.game.selectedTowerType;
    let cfg = TOWER_TYPES[type] || TOWER_TYPES.basic;
    let currentGold = this.game.economy ? this.game.economy.getGold() : 0;
    let canAfford = currentGold >= cfg.cost;
    let [r, g, b] = cfg.color;

    // 4. 将鼠标位置映射到网格坐标
    let col = pixelToCol(mx);
    let row = pixelToRow(my);
    let gridX = colToCenterX(col);
    let gridY = rowToCenterY(row);

    // 5. 核心：计算背景图被压缩后的视觉格子高度
    // 逻辑：背景图占用的总像素高度除以总行数
    const safeHeight = TOWER_PANEL_TOP - HUD_HEIGHT; 
    const visualGridHeight = safeHeight / ROWS; 

    // 6. 检查是否可建造
    let tileOk = this.game.canBuildAt(col, row);
    let canPlace = tileOk && canAfford;
    let blocked = !canPlace;

    // 7. 绘制格子高亮层
    push();
    rectMode(CENTER);
    noStroke();
    if (canPlace) {
      fill(40, 220, 80, 55);    // 绿色 - 可以建造
    } else {
      fill(220, 50, 50, 70);    // 红色 - 被阻挡
    }
    
    // 关键修正：宽度使用原始尺寸，高度使用计算出的视觉高度，以对齐地图格子
    rect(gridX, gridY, CURRENT_GRID_SIZE, visualGridHeight, 4);

    // 8. 如果被阻挡，绘制红色 "✕" 叉号
    if (blocked) {
      stroke(240, 60, 60, 200);
      strokeWeight(2.5);
      // 叉号也根据视觉高度比例缩放
      let sW = CURRENT_GRID_SIZE * 0.22;
      let sH = visualGridHeight * 0.22; 
      line(gridX - sW, gridY - sH, gridX + sW, gridY + sH);
      line(gridX + sW, gridY - sH, gridX - sW, gridY + sH);
    }
    pop();

    // 9. 绘制攻击范围圆圈
    noFill();
    if (blocked) {
      stroke(220, 60, 60, canAfford ? 90 : 50);
    } else {
      stroke(r, g, b, 110);
    }
    strokeWeight(type === 'area' ? 2.2 : 1.5);
    let rangeRadius = type === 'crystal' ? (cfg.boostRadius || cfg.range) : cfg.range;
    ellipse(gridX, gridY, rangeRadius * 2, rangeRadius * 2);

    // 10. 绘制防御塔预览半透明图片
    if (!blocked) {
      let previewImg = this.getTowerImage(type);
      if (previewImg && previewImg.width > 0) {
        tint(255, 180); // 设置透明度
        imageMode(CENTER);
        // 防御塔图片可以稍微根据视觉高度也做一点压缩，或者保持比例
        let imgW = CURRENT_GRID_SIZE - 2;
        let imgH = visualGridHeight - 2; 
        image(previewImg, gridX, gridY, imgW, imgH);
        noTint();
      } else {
        noStroke();
        fill(r, g, b, 140);
        ellipse(gridX, gridY, cfg.size, cfg.size);
      }
    }
  }

  handleEndScreenClick(mx, my) {
    for (let button of this.endScreenButtons) {
      if (mx >= button.x && mx <= button.x + button.w &&
        my >= button.y && my <= button.y + button.h) {
        this.game.sound.play("click2");
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

  drawTutorialOverlay() {
    if (typeof game === 'undefined' || !game.tutorialMode) return;

    let step = TUTORIAL_STEPS[game.tutorialStep];
    if (!step) return;

    push();

    this.drawTutorialDarkOverlay(step.highlight);
    this.drawTutorialDialog(step);
    this.drawTutorialSkipBtn();

    if (this.tutorialDebugMode) {
      this.drawTutorialDebugOverlay();
    }

    pop();
  }

  drawTutorialDarkOverlay(highlightType) {
    fill(0, 0, 0, 180);
    noStroke();
    rectMode(CORNER);

    let highlightArea = this.getTutorialHighlightArea(highlightType);

    if (highlightArea && highlightType !== 'none') {
      let hx = highlightArea.x;
      let hy = highlightArea.y;
      let hw = highlightArea.w;
      let hh = highlightArea.h;
      let pad = 10;

      // Top
      rect(0, 0, CANVAS_WIDTH, hy - pad);
      // Bottom
      rect(0, hy + hh + pad, CANVAS_WIDTH, CANVAS_HEIGHT - (hy + hh + pad));
      // Left
      rect(0, hy - pad, hx - pad, hh + pad * 2);
      // Right
      rect(hx + hw + pad, hy - pad, CANVAS_WIDTH - (hx + hw + pad), hh + pad * 2);

      // Highlight border
      stroke(255, 220, 100);
      strokeWeight(4);
      noFill();
      rect(hx - pad, hy - pad, hw + pad * 2, hh + pad * 2, 8);

      // Pulsing glow
      let pulse = (sin(frameCount * 0.1) + 1) * 0.5;
      stroke(255, 220, 100, 100 + pulse * 100);
      strokeWeight(8);
      rect(hx - pad - 4, hy - pad - 4, hw + pad * 2 + 8, hh + pad * 2 + 8, 12);
      noStroke();
    } else {
      rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  getTutorialHighlightArea(highlightType) {
    // Use custom highlightArea from step config if defined and non-zero
    let currentStep = TUTORIAL_STEPS[game.tutorialStep];
    if (currentStep && currentStep.highlightArea &&
      currentStep.highlightArea.w > 0 && currentStep.highlightArea.h > 0) {
      return currentStep.highlightArea;
    }

    // Fallback to hardcoded defaults (update after debugging with T key)
    switch (highlightType) {
      case 'landmark':
        if (typeof game !== 'undefined' && game.landmark) {
          return {
            x: game.landmark.x - 60,
            y: game.landmark.y - 80,
            w: 120,
            h: 160
          };
        }
        return { x: CANVAS_WIDTH - 200, y: 300, w: 150, h: 200 };

      case 'path':
        return { x: 100, y: 250, w: CANVAS_WIDTH - 250, h: 200 };

      case 'tower_panel': {
        let panelH = 80;
        return { x: 150, y: CANVAS_HEIGHT - panelH - 5, w: CANVAS_WIDTH - 200, h: panelH + 5 };
      }

      case 'buildable':
        return { x: 300, y: 350, w: 400, h: 150 };

      case 'gold':
        return { x: 150, y: CANVAS_HEIGHT - 75, w: 120, h: 60 };

      case 'lives':
        return { x: 10, y: 10, w: 200, h: 60 };

      case 'none':
      default:
        return null;
    }
  }

  drawTutorialDialog(step) {
    let mx = getGameMouseX();
    let my = getGameMouseY();

    let dialogW = 450;
    let dialogH = 220;
    let dialogX, dialogY;

    switch (step.position) {
      case 'left':
        dialogX = 50;
        dialogY = CANVAS_HEIGHT / 2 - dialogH / 2;
        break;
      case 'right':
        dialogX = CANVAS_WIDTH - dialogW - 50;
        dialogY = CANVAS_HEIGHT / 2 - dialogH / 2;
        break;
      case 'top':
        dialogX = CANVAS_WIDTH / 2 - dialogW / 2;
        dialogY = 100;
        break;
      case 'bottom':
        dialogX = CANVAS_WIDTH / 2 - dialogW / 2;
        dialogY = CANVAS_HEIGHT - dialogH - 150;
        break;
      case 'center':
      default:
        dialogX = CANVAS_WIDTH / 2 - dialogW / 2;
        dialogY = CANVAS_HEIGHT / 2 - dialogH / 2;
    }

    fill(35, 30, 25, 245);
    stroke(200, 170, 120);
    strokeWeight(4);
    rectMode(CORNER);
    rect(dialogX, dialogY, dialogW, dialogH, 12);

    stroke(120, 100, 70);
    strokeWeight(2);
    rect(dialogX + 8, dialogY + 8, dialogW - 16, dialogH - 16, 8);
    noStroke();

    // Step indicator
    fill(150, 150, 150);
    textAlign(RIGHT, TOP);
    textSize(15);
    text((game.tutorialStep + 1) + "/" + TUTORIAL_STEPS.length, dialogX + dialogW - 20, dialogY + 15);

    // Title
    fill(255, 220, 150);
    textAlign(LEFT, TOP);
    textSize(26);
    textStyle(BOLD);
    text(step.title, dialogX + 25, dialogY + 20);
    textStyle(NORMAL);

    // Message
    fill(220, 220, 220);
    textSize(18);
    textLeading(28);
    text(step.message, dialogX + 25, dialogY + 55, dialogW - 50, 120);

    // Breathing prompt
    let promptAlpha = 127 + 128 * sin(frameCount * 0.05);
    fill(255, 255, 255, promptAlpha);
    textAlign(CENTER, CENTER);
    textSize(19);
    text("Click anywhere to continue", dialogX + dialogW / 2, dialogY + dialogH + 30);
    textAlign(LEFT, TOP); // Reset alignment
  }

  drawTutorialSkipBtn() {
    let mx = getGameMouseX();
    let my = getGameMouseY();

    let skipW = 80;
    let skipH = 30;
    let skipX = CANVAS_WIDTH - skipW - 20;
    let skipY = 20;

    let isSkipHover = mx >= skipX && mx <= skipX + skipW &&
      my >= skipY && my <= skipY + skipH;

    fill(isSkipHover ? color(100, 80, 80) : color(70, 55, 55));
    stroke(isSkipHover ? color(180, 140, 140) : color(130, 100, 100));
    strokeWeight(2);
    rectMode(CORNER);
    rect(skipX, skipY, skipW, skipH, 5);

    fill(isSkipHover ? 255 : 200);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);
    text("Skip", skipX + skipW / 2, skipY + skipH / 2);

    this.tutorialSkipBtn = { x: skipX, y: skipY, w: skipW, h: skipH };
  }

  drawTutorialDebugOverlay() {
    push();

    let mx = getGameMouseX();
    let my = getGameMouseY();

    // Grid lines
    for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
      if (x % 100 === 0) {
        stroke(255, 255, 0, 50);
        strokeWeight(2);
      } else {
        stroke(255, 255, 255, 30);
        strokeWeight(1);
      }
      line(x, 0, x, CANVAS_HEIGHT);
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 50) {
      if (y % 100 === 0) {
        stroke(255, 255, 0, 50);
        strokeWeight(2);
      } else {
        stroke(255, 255, 255, 30);
        strokeWeight(1);
      }
      line(0, y, CANVAS_WIDTH, y);
    }

    // Crosshair at mouse
    stroke(255, 0, 255);
    strokeWeight(2);
    line(mx - 30, my, mx + 30, my);
    line(mx, my - 30, mx, my + 30);

    // Recorded clicks
    for (let i = 0; i < this.tutorialDebugClicks.length; i++) {
      let c = this.tutorialDebugClicks[i];
      fill(0, 255, 0);
      stroke(255);
      strokeWeight(2);
      ellipse(c.x, c.y, 15, 15);

      fill(255);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
      text(i + 1, c.x, c.y);
    }

    // Preview rectangle when one click is recorded
    if (this.tutorialDebugClicks.length === 1) {
      let c1 = this.tutorialDebugClicks[0];
      let rx = Math.min(c1.x, mx);
      let ry = Math.min(c1.y, my);
      let rw = Math.abs(mx - c1.x);
      let rh = Math.abs(my - c1.y);

      fill(255, 255, 0, 30);
      stroke(255, 255, 0);
      strokeWeight(2);
      rectMode(CORNER);
      rect(rx, ry, rw, rh);
    }

    // Debug info panel
    fill(0, 0, 0, 230);
    stroke(255, 255, 0);
    strokeWeight(2);
    rectMode(CORNER);
    rect(10, 10, 320, 200, 8);

    fill(255, 255, 0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    textStyle(BOLD);
    text("TUTORIAL DEBUG MODE", 20, 20);
    textStyle(NORMAL);

    textSize(12);
    fill(255);
    let infoY = 45;
    text("Current Step: " + (game.tutorialStep + 1) + "/" + TUTORIAL_STEPS.length, 20, infoY); infoY += 18;
    text("Step ID: " + TUTORIAL_STEPS[game.tutorialStep].id, 20, infoY); infoY += 18;
    text("Mouse: (" + Math.round(mx) + ", " + Math.round(my) + ")", 20, infoY); infoY += 18;
    text("Clicks recorded: " + this.tutorialDebugClicks.length + "/2", 20, infoY); infoY += 25;

    fill(200, 200, 200);
    textSize(11);
    text("Controls:", 20, infoY); infoY += 15;
    text("T - Toggle debug mode", 20, infoY); infoY += 14;
    text("1-8 - Jump to step", 20, infoY); infoY += 14;
    text("Click twice - Record highlight area", 20, infoY); infoY += 14;
    text("P - Print all configs", 20, infoY); infoY += 14;
    text("C - Clear clicks", 20, infoY);

    pop();
  }

  printTutorialHighlightConfig() {
    console.log('='.repeat(60));
    console.log('TUTORIAL HIGHLIGHT CONFIGURATIONS');
    console.log('Copy these values into TUTORIAL_STEPS highlightArea in constants.js:');
    console.log('='.repeat(60));
    console.log('');

    for (let i = 0; i < TUTORIAL_STEPS.length; i++) {
      let step = TUTORIAL_STEPS[i];
      if (step.highlight !== 'none') {
        let area = this.getTutorialHighlightArea(step.highlight);
        if (area) {
          console.log("Step " + (i + 1) + " '" + step.id + "' (" + step.highlight + "):");
          console.log("  highlightArea: { x: " + area.x + ", y: " + area.y +
            ", w: " + area.w + ", h: " + area.h + " }");
        } else {
          console.log("Step " + (i + 1) + " '" + step.id + "': no highlight area set");
        }
      }
    }

    console.log('');
    console.log('='.repeat(60));
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
