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

    stopAll() {
        for (let k in this.sounds) {
            let s = this.sounds[k];
            if (!s) continue;
            s.pause();
            s.currentTime = 0;
        }
    }

    /** Reserved for menu / level music routing (p5.sound uses separate tracks). */
    playTrack(_name) {
        // No-op: background music is driven by UIHUD / p5.sound where configured.
    }
}