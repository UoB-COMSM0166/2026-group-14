class SoundManager {
    constructor() {
        this.sounds = {};
    }

    load(name, path) {
        this.sounds[name] = new Audio(path);
    }

    play(name, volume = 1) {
        let s = this.sounds[name];
        if (!s) return;
        s.currentTime = 0;
        s.volume = volume;
        s.play();
    }
}