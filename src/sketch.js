let game;
let _bgImage, _settingsBgImg;

let bgMusic;
let musicTracks = {};

function preload() {
  _bgImage = loadImage('../src/assets/magic_background.png');
  _settingsBgImg = loadImage('../src/assets/PNG/panelInset_brown.png');
  musicTracks['Epic Battle Music'] = loadSound('../src/soundtracks/epic.mp3');
  musicTracks['Peaceful Village'] = loadSound('../src/soundtracks/peace_vil.mp3');
  musicTracks['Dark Dungeon'] = loadSound('../src/soundtracks/dark_dungeon.mp3');
}

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  frameRate(FPS);
  game = new GameManager();
  game.ui.bgImage = _bgImage;
  game.ui.settingsBgImg = _settingsBgImg;
  game.ui.musicTracks = musicTracks;
  game.ui.setupUI();
  console.log("Game initialised");
}

function draw() {
  game.update();
  game.render();
}

function mousePressed() {
  if (!game.ui.audioStarted) {
    userStartAudio().then(() => {
      console.log("Audio Activated!");
      game.ui.audioStarted = true;
      game.ui.updateMusicTrack();
    });

    return;
  }
  game.handleClick(mouseX, mouseY);
}

function keyPressed() {
  let state = game.getState();

  if (state === GameState.MENU) {
    if (key === '1') game.startLevel(1);
    if (key === '2') game.startLevel(2);
    if (key === '3') game.startLevel(3);
    return;
  }
  if (state === GameState.PLAYING) {
    if (key === 'p' || key === 'P') game.pause();
    if (key === 'r' || key === 'R') game.restart();
    if (key === 't' || key === 'T') {
      if (game.landmark) {
        game.landmark.takeDamage(ENEMY_REACH_DAMAGE);
        game.checkWinLose();
      }
    }
    return;
  }
  if (state === GameState.PAUSED) {
    if (key === 'p' || key === 'P') game.resume();
    if (key === 'r' || key === 'R') game.restart();
    return;
  }
  if (state === GameState.SETTINGS) {
    if (key === 'b' || key === 'B') game.setState(GameState.MENU);
    return;
  }
  if (state === GameState.WIN) {
    if (key === 'n' || key === 'N') game.nextLevel();
    if (key === 'r' || key === 'R') game.restart();
    return;
  }
  if (state === GameState.LOSE) {
    if (key === 'r' || key === 'R') game.restart();
    return;
  }
}