let bgImage; // Main menu background image
let settingsBgImg; // Settings panel background image
let playButton, settingsButton, exitButton;
let gameState = 'menu'; // 'menu' | 'playing' | 'settings' | 'exit'
let settingsPanelFrame; // Decorative frame image (reserved)
let medievalFont; // Optional title font (reserved)
let closeSettingsBtn; // Close button in settings panel
let musicSlider, brightnessSlider, musicSelect
let backBtn;

function hideSettingsUI() {
  musicSlider.hide();
  musicSelect.hide();
  brightnessSlider.hide();
  if (closeSettingsBtn) closeSettingsBtn.hide();
  backBtn.hide();
}
function showSettingsUI(startY, spacing) {
  let sliderX = width / 2 - 50;
  let imgW = 500;
  let imgH = 600;
  let cornerX = width / 2 - imgW / 2;
  let cornerY = height / 2 - imgH / 2;
  musicSlider.show();
  musicSlider.position(sliderX, startY - 10);

  musicSelect.show();
  musicSelect.position(sliderX, startY + spacing - 10);

  brightnessSlider.show();
  brightnessSlider.position(sliderX, startY + spacing * 2 - 10);

  closeSettingsBtn.show();
  // Keep clear of the panel border texture.
  closeSettingsBtn.position(cornerX + 25, cornerY + 25);

  backBtn.show();
  // Place at the bottom area of the panel.
  backBtn.position(width / 2 - backBtn.elt.offsetWidth / 2, height / 2 + 100);
}
function setupSettings() {
  // Shared style for select and sliders.
  let uiElementStyle = `
    background: #5D4037;
    color: #FFECB3;
    border: 3px solid #9b7b12;
    border-radius: 30px;
    padding: 5px;
    font-family: 'Georgia', serif;
    font-size: 16px;
  `;


  let thumbStyle = `
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #FFECB3;
    cursor: pointer;
    border: 2px solid #5D4037;
    margin-top: -6px;
  `;


  // Music volume slider.
  musicSlider = createSlider(0, 1, 0.5, 0.01);
  musicSlider.elt.style.setProperty('--thumb-bg', thumbStyle);
  musicSlider.elt.style.setProperty('--thumb-border', 'none');
  // p5 slider thumbs are limited; use CSS selectors for full control.
  // input[type=range]::-webkit-slider-thumb { ... }


  // Music track selector.
  musicSelect = createSelect();
  musicSelect.option('Epic Battle Music');
  musicSelect.option('Peaceful Village');
  musicSelect.option('Dark Dungeon');
  musicSelect.style(uiElementStyle);
  musicSelect.style('width', '160px');
  musicSelect.style('text-align', 'center');
  musicSelect.style('color', '#FFECB3');
  musicSelect.style('height', '35px');
  musicSelect.style('border', '2px solid #FFD54F');
  musicSelect.style('border-radius', '8px');
  musicSelect.style('box-sizing', 'border-box'); // keep border inside width
  musicSelect.style('appearance', 'none'); // enable consistent custom styling
  musicSelect.style('-webkit-appearance', 'none');

  // Brightness slider.
  brightnessSlider = createSlider(0, 255, 255);

  // Back button in settings.
  backBtn = createButton('Back to Menu');
  backBtn.mousePressed(() => { gameState = 'menu'; });
  let backButtonStyle = `
    background: #795548;
    color: #FFECB3;
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

  // Icon-only close button.
  closeSettingsBtn = createButton('');
  closeSettingsBtn.mousePressed(() => { gameState = 'menu'; });

  // Use icon sprite as button background.
  closeSettingsBtn.style('background', `url('assets/PNG/iconCross_brown.png') no-repeat center center`);
  closeSettingsBtn.style('background-size', 'contain');
  closeSettingsBtn.style('border', 'none');
  closeSettingsBtn.style('width', '30px');
  closeSettingsBtn.style('height', '30px');
  closeSettingsBtn.style('cursor', 'pointer');
  closeSettingsBtn.style('outline', 'none');

  // Subtle hover feedback.
  closeSettingsBtn.mouseOver(() => closeSettingsBtn.style('transform', 'scale(1.1)'));
  closeSettingsBtn.mouseOut(() => closeSettingsBtn.style('transform', 'scale(1.0)'));
  // Hide settings controls until settings view is active.
  hideSettingsUI();
}
// Preload static images.
function preload() {
  bgImage = loadImage('assets/magic_background.png');
  settingsBgImg = loadImage('assets/PNG/panelInset_brown.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupSettings();
  // Create main menu buttons.
  let buttonWidth = 220;
  let buttonHeight = 70;
  let startY = height / 2 - buttonHeight * 1.5;

  playButton = createButton('Start');
  playButton.position(width / 2 - buttonWidth / 2, startY);
  playButton.size(buttonWidth, buttonHeight);
  playButton.mousePressed(() => gameState = 'playing');
  playButton.addClass('menu-button');

  settingsButton = createButton('Settings');
  settingsButton.position(width / 2 - buttonWidth / 2, startY + buttonHeight + 25);
  settingsButton.size(buttonWidth, buttonHeight);
  settingsButton.mousePressed(() => {
    gameState = 'settings';
  });
  settingsButton.addClass('menu-button');

  exitButton = createButton('Exit');
  exitButton.position(width / 2 - buttonWidth / 2, startY + (buttonHeight + 25) * 2);
  exitButton.size(buttonWidth, buttonHeight);
  exitButton.mousePressed(() => gameState = 'exit');
  exitButton.addClass('menu-button');

  // Buttons are shown only in menu state.
  toggleMenuButtons(false);

}

function draw() {
  // Base layer: background + brightness overlay.
  image(bgImage, 0, 0, width, height);

  let bValue = brightnessSlider.value();
  fill(0, 255 - bValue);
  noStroke();
  rect(0, 0, width, height);

  // Render current state.
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
      toggleMenuButtons(false);
      drawSettingsScreen();
      break;
    case 'exit':
      hideSettingsUI();
      toggleMenuButtons(false);
      drawExitScreen();
      break;
  }
}
// Draw menu screen.
function drawMenu() {
  toggleMenuButtons(true);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(72);
  textStyle(BOLD);
  // Optional custom font:
  // textFont('Your Medieval Font');
  text('Defend London', width / 2, height / 4.5);
}

// Draw placeholder in-game screen.
function drawPlayingScreen() {
  toggleMenuButtons(false);
  fill(50, 200, 50, 180);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text('Game is running...', width / 2, height / 2);
  textSize(24);
  text('Click anywhere to return to menu', width / 2, height / 2 + 60);
}


function drawSettingsScreen() {
  toggleMenuButtons(false);

  // Draw settings panel background.
  let imgW = 500;
  let imgH = 600;
  imageMode(CENTER);
  image(settingsBgImg, width / 2, height / 2, imgW, imgH);
  imageMode(CORNER);

  // Draw labels and title.
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(32);
  textStyle(BOLD);
  textFont('Georgia');
  text("SETTINGS", width / 2 + 2, height / 2 - imgH / 2 + 102);

  textSize(18);
  // Keep labels aligned with controls.
  let labelX = width / 2 - 150;
  let startY = height / 2 - 100;
  let spacing = 55;

  text("Music Volume :", labelX, startY);
  text("Switch Track :", labelX, startY + spacing);
  text("Brightness :", labelX, startY + spacing * 2);

  // Reset text style for other screens.
  textStyle(NORMAL);
  showSettingsUI(startY, spacing);
}
// Draw exit screen placeholder.
function drawExitScreen() {

}

function mousePressed() {
  if (gameState === 'playing') {
    gameState = 'menu';
  }
}


// Re-layout UI on window resize.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let buttonWidth = 220;
  let buttonHeight = 70;
  let startY = height / 2 - buttonHeight * 1.5;

  playButton.position(width / 2 - buttonWidth / 2, startY);
  settingsButton.position(width / 2 - buttonWidth / 2, startY + buttonHeight + 25);
  exitButton.position(width / 2 - buttonWidth / 2, startY + (buttonHeight + 25) * 2);
}

// Helper: toggle main menu buttons.
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