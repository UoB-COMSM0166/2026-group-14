let bgImage; // 背景图片（城堡与可爱的士兵和怪兽）
let settingsBgImg; // 声明设置页面的背景图变量
let playButton, settingsButton, exitButton;
let gameState = 'menu'; // 游戏状态：'menu', 'playing', 'settings', 'exit'
let settingsPanelFrame; // 设置面板的装饰边框图片
let medievalFont; // 可能的自定义字体
let closeSettingsBtn; // 交互按钮对象
let musicSlider, brightnessSlider, musicSelect
let backBtn;
let isBold = false;

function hideSettingsUI() {
  musicSlider.hide();
  musicSelect.hide();
  brightnessSlider.hide();
  if (closeSettingsBtn) closeSettingsBtn.hide(); // 隐藏按钮组件
  backBtn.hide();
}
function showSettingsUI(startY, spacing) {
  let sliderX = width / 2 - 50; // 滑块起始点在中心偏左一点
  let imgW = 500; // 必须与背景图绘制宽度一致
  let imgH = 600; // 必须与背景图绘制高度一致
  let cornerX = width / 2 - imgW / 2;
  let cornerY = height / 2 - imgH / 2;
  musicSlider.show();
  musicSlider.position(sliderX, startY - 10); // -10 是为了视觉上与文字对齐

  musicSelect.show();
  musicSelect.position(sliderX, startY + spacing - 10);

  brightnessSlider.show();
  brightnessSlider.position(sliderX, startY + spacing * 2 - 10);

  closeSettingsBtn.show();
  // 放在面板左上角，偏移 25 像素避开边框纹路
  closeSettingsBtn.position(cornerX + 25, cornerY + 25);

  backBtn.show();
  // 返回按钮放在背景图底部
  backBtn.position(width / 2 - backBtn.elt.offsetWidth / 2, height / 2 + 100);
}
function setupSettings() {
  // 定义通用样式
  let uiElementStyle = `
    background: #5D4037;    /* 改为深棕色 */
    color: #FFECB3;         /* 浅金色文字 */
    border: 3px solid #9b7b12; /* 边框加粗到 3px，颜色改为更亮的金色 */
    border-radius: 30px;     /* 圆角稍微调大一点更有质感 */
    padding: 5px;
    font-family: 'Georgia', serif;
    font-size: 16px;
  `;


  let thumbStyle = `
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%; /* 圆形滑块 */
    background: #FFECB3; /* 滑块颜色 */
    cursor: pointer;
    border: 2px solid #5D4037;
    margin-top: -6px; /* 调整滑块居中 */
  `;


  // 1. 音乐音量滑块
  musicSlider = createSlider(0, 1, 0.5, 0.01);
  musicSlider.elt.style.setProperty('--thumb-bg', thumbStyle); // P5.js 默认不支持滑块Thumb样式，需要JS直接设置
  musicSlider.elt.style.setProperty('--thumb-border', 'none'); // 需要额外的CSS来控制滑块
  // 由于p5.js的createSlider无法直接完全自定义滑块样式，这里我们通过更复杂的方法添加
  // 或者直接在你的HTML文件中添加CSS样式：
  // input[type=range]::-webkit-slider-thumb { ... }


  // 2. 切换音乐选项
  musicSelect = createSelect();
  musicSelect.option('Epic Battle Music');
  musicSelect.option('Peaceful Village');
  musicSelect.option('Dark Dungeon');
  musicSelect.style(uiElementStyle);
  musicSelect.style('width', '160px');
  musicSelect.style('text-align', 'center');
  musicSelect.style('color', '#FFECB3');
  musicSelect.style('height', '35px');// 调整宽度
  musicSelect.style('border', '2px solid #FFD54F'); // 设置 4px 粗边框
  musicSelect.style('border-radius', '8px');
  musicSelect.style('box-sizing', 'border-box');     // 极其重要：防止边框把盒子撑开
  musicSelect.style('appearance', 'none');          // 去掉系统默认外观，让自定义边框生效
  musicSelect.style('-webkit-appearance', 'none');

  // 3. 亮度滑块
  brightnessSlider = createSlider(0, 255, 255);

  // 5. 返回按钮
  backBtn = createButton('Back to Menu');
  backBtn.mousePressed(() => { gameState = 'menu'; });
  let backButtonStyle = `
    background: #795548; /* 稍亮的棕色 */
    color: #FFECB3; /* 浅金色文字 */
    border: 2px solid #FFECB3;
    border-radius: 6px;
    padding: 8px 20px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    font-family: 'Georgia', serif;
    transition: background 0.2s, transform 0.2s;
  `;
  backBtn.style(backButtonStyle);
  backBtn.mouseOver(() => backBtn.style('background', '#A1887F'));
  backBtn.mouseOut(() => backBtn.style('background', '#795548'));

  // 2. 修复图标按钮创建
  closeSettingsBtn = createButton('');
  closeSettingsBtn.mousePressed(() => { gameState = 'menu'; });

  // 设置按钮背景图
  closeSettingsBtn.style('background', `url('assets/PNG/iconCross_brown.png') no-repeat center center`);
  closeSettingsBtn.style('background-size', 'contain');
  closeSettingsBtn.style('border', 'none');
  closeSettingsBtn.style('width', '30px');
  closeSettingsBtn.style('height', '30px');
  closeSettingsBtn.style('cursor', 'pointer');
  closeSettingsBtn.style('outline', 'none');

  // 悬停缩放效果
  closeSettingsBtn.mouseOver(() => closeSettingsBtn.style('transform', 'scale(1.1)'));
  closeSettingsBtn.mouseOut(() => closeSettingsBtn.style('transform', 'scale(1.0)'));
  // 初始隐藏所有设置UI元素
  hideSettingsUI();
}
// 预加载所有图片资源
function preload() {
  // 使用之前生成的可爱城堡背景图片
  bgImage = loadImage('assets/magic_background.png');
  settingsBgImg = loadImage('assets/PNG/panelInset_brown.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupSettings();
  // 创建菜单按钮
  let buttonWidth = 220;
  let buttonHeight = 70;
  let startY = height / 2 - buttonHeight * 1.5; // 居中偏上，留出标题空间

  playButton = createButton('Start');
  playButton.position(width / 2 - buttonWidth / 2, startY);
  playButton.size(buttonWidth, buttonHeight);
  playButton.mousePressed(() => gameState = 'playing');
  playButton.addClass('menu-button'); // 添加CSS类以便样式化

  settingsButton = createButton('Settings');
  settingsButton.position(width / 2 - buttonWidth / 2, startY + buttonHeight + 25); // 按钮之间间距
  settingsButton.size(buttonWidth, buttonHeight);
  settingsButton.mousePressed(() => {
    gameState = 'settings';
  });
  settingsButton.addClass('menu-button');

  exitButton = createButton('Exit'); // 退出按钮
  exitButton.position(width / 2 - buttonWidth / 2, startY + (buttonHeight + 25) * 2);
  exitButton.size(buttonWidth, buttonHeight);
  // 对于网页游戏，"退出"通常是返回主页或关闭tab
  // 这里我们模拟一个简单的提示
  exitButton.mousePressed(() => gameState = 'exit');
  exitButton.addClass('menu-button');

  // 初始隐藏所有按钮，只在菜单状态显示
  toggleMenuButtons(false);

}

function draw() {
  // 1. 基础绘制（背景 + 亮度遮罩）
  image(bgImage, 0, 0, width, height);

  let bValue = brightnessSlider.value();
  fill(0, 255 - bValue);
  noStroke();
  rect(0, 0, width, height);

  // 2. 状态切换
  switch (gameState) {
    case 'menu':
      hideSettingsUI();
      drawMenu();
      break;
    case 'playing':
      hideSettingsUI();
      toggleMenuButtons(false);
      drawPlayingScreen();
      break;
    case 'settings':
      toggleMenuButtons(false); // 隐藏主菜单按钮
      drawSettingsScreen();
      break;
    case 'exit':
      hideSettingsUI();
      toggleMenuButtons(false);
      drawExitScreen();
      break;
  }
}
// 绘制菜单界面
function drawMenu() {
  toggleMenuButtons(true); // 显示按钮

  // 绘制标题
  fill(255); // 白色文字
  textAlign(CENTER, CENTER);
  textSize(72); // 大一点的标题
  textStyle(BOLD);
  // 使用一个更具中世纪/奇幻感的字体，如果已加载
  // textFont('Your Medieval Font');
  text('Defend London', width / 2, height / 4.5); // 标题位置稍微靠上
}

// 绘制“正在游戏”界面
function drawPlayingScreen() {
  toggleMenuButtons(false); // 隐藏按钮
  fill(50, 200, 50, 180); // 半透明绿色背景
  rect(0, 0, width, height); // 覆盖整个屏幕
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text('游戏进行中...', width / 2, height / 2);
  textSize(24);
  text('点击任意位置返回菜单', width / 2, height / 2 + 60);
}


function drawSettingsScreen() {
  toggleMenuButtons(false); // 隐藏主菜单按钮

  // 1. 绘制背景图片
  // 假设你想让这张图居中显示，并保持特定大小（比如 500x600）
  let imgW = 500;
  let imgH = 600;
  imageMode(CENTER); // 设置图片绘制模式为中心
  image(settingsBgImg, width / 2, height / 2, imgW, imgH);
  imageMode(CORNER); // 绘完后重置回默认模式，以免影响其他部分

  // 2. 绘制标题和文字
  textAlign(CENTER, CENTER);
  fill(255); // 或者根据你图片的颜色调整文字颜色
  textSize(32);
  textStyle(BOLD);
  textFont('Georgia'); // 使用一个更具中世纪/奇幻感的字体，如果已加载
  text("SETTINGS", width / 2 + 2, height / 2 - imgH / 2 + 102); // 标题放在图片内部顶端

  textSize(18);
  // labelX 应该根据滑块的位置来定，确保文字不会盖住滑块
  let labelX = width / 2 - 150;
  let startY = height / 2 - 100; // 稍微向下平移，避开标题
  let spacing = 55; // 统一间距变量，方便后期一次性修改

  text("Music Volume :", labelX, startY);
  text("Switch Track :", labelX, startY + spacing);
  text("Brightness :", labelX, startY + spacing * 2);

  // 重置文字样式，避免影响其他页面
  textStyle(NORMAL);
  showSettingsUI(startY, spacing); // 显示设置界面的 UI 元素
}
// 绘制“退出游戏”界面
function drawExitScreen() {

}


// 当窗口大小改变时，重新调整画布和按钮位置
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let buttonWidth = 220;
  let buttonHeight = 70;
  let startY = height / 2 - buttonHeight * 1.5;

  playButton.position(width / 2 - buttonWidth / 2, startY);
  settingsButton.position(width / 2 - buttonWidth / 2, startY + buttonHeight + 25);
  exitButton.position(width / 2 - buttonWidth / 2, startY + (buttonHeight + 25) * 2);
}

// 辅助函数：显示或隐藏菜单按钮
function toggleMenuButtons(show) {
  if (show) {
    playButton.show();
    settingsButton.show();
    exitButton.show();
  } else {
    playButton.hide();
    settingsButton.hide();
    exitButton.hide();
  }
}