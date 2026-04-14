// SaveSystem - simple nickname-based localStorage persistence
// Data model is intentionally small: unlock progression + minimal stats.

class SaveSystem {
  static STORAGE_PREFIX = 'gamefix.player.';
  static ACTIVE_PLAYER_KEY = 'gamefix.activePlayer';
  static RUN_SAVE_SUFFIX = '.run';
  static CURRENT_VERSION = 1;

  static normaliseNickname(nickname) {
    if (nickname == null) return '';
    return String(nickname).trim();
  }

  static isValidNickname(nickname) {
    let n = SaveSystem.normaliseNickname(nickname);
    // Keep it permissive for CN/EN names; just avoid empty / very long.
    return n.length >= 1 && n.length <= 20;
  }

  static _playerKey(nickname) {
    return SaveSystem.STORAGE_PREFIX + encodeURIComponent(nickname);
  }

  static _runKey(nickname) {
    return SaveSystem._playerKey(nickname) + SaveSystem.RUN_SAVE_SUFFIX;
  }

  static getActiveNickname() {
    try {
      return SaveSystem.normaliseNickname(localStorage.getItem(SaveSystem.ACTIVE_PLAYER_KEY));
    } catch (e) {
      console.warn('[Save] localStorage not available:', e);
      return '';
    }
  }

  static setActiveNickname(nickname) {
    let n = SaveSystem.normaliseNickname(nickname);
    try {
      localStorage.setItem(SaveSystem.ACTIVE_PLAYER_KEY, n);
    } catch (e) {
      console.warn('[Save] Failed to set active player:', e);
    }
  }

  static defaultProfile(nickname) {
    return {
      version: SaveSystem.CURRENT_VERSION,
      nickname: SaveSystem.normaliseNickname(nickname),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unlockedUpTo: 1, // New players can only play Level 1
      lastCompletedLevel: 0,
      totalWins: 0
    };
  }

  static loadProfile(nickname) {
    let n = SaveSystem.normaliseNickname(nickname);
    if (!n) return null;
    try {
      let raw = localStorage.getItem(SaveSystem._playerKey(n));
      if (!raw) return SaveSystem.defaultProfile(n);
      let parsed = JSON.parse(raw);
      // Very small "migration": ensure required fields exist.
      let base = SaveSystem.defaultProfile(n);
      let prof = { ...base, ...parsed, nickname: n };
      if (typeof prof.unlockedUpTo !== 'number' || prof.unlockedUpTo < 1) prof.unlockedUpTo = 1;
      if (prof.unlockedUpTo > TOTAL_LEVELS) prof.unlockedUpTo = TOTAL_LEVELS;
      if (typeof prof.lastCompletedLevel !== 'number') prof.lastCompletedLevel = 0;
      if (typeof prof.totalWins !== 'number') prof.totalWins = 0;
      return prof;
    } catch (e) {
      console.warn('[Save] Failed to load profile, resetting:', e);
      return SaveSystem.defaultProfile(n);
    }
  }

  static saveProfile(profile) {
    if (!profile) return false;
    let n = SaveSystem.normaliseNickname(profile.nickname);
    if (!n) return false;
    try {
      profile.updatedAt = Date.now();
      localStorage.setItem(SaveSystem._playerKey(n), JSON.stringify(profile));
      return true;
    } catch (e) {
      console.warn('[Save] Failed to save profile:', e);
      return false;
    }
  }

  static loadRun(nickname) {
    let n = SaveSystem.normaliseNickname(nickname);
    if (!n) return null;
    try {
      let raw = localStorage.getItem(SaveSystem._runKey(n));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Save] Failed to load run save:', e);
      return null;
    }
  }

  static saveRun(nickname, runData) {
    let n = SaveSystem.normaliseNickname(nickname);
    if (!n) return false;
    try {
      localStorage.setItem(SaveSystem._runKey(n), JSON.stringify(runData));
      return true;
    } catch (e) {
      console.warn('[Save] Failed to save run:', e);
      return false;
    }
  }

  static clearRun(nickname) {
    let n = SaveSystem.normaliseNickname(nickname);
    if (!n) return false;
    try {
      localStorage.removeItem(SaveSystem._runKey(n));
      return true;
    } catch (e) {
      console.warn('[Save] Failed to clear run:', e);
      return false;
    }
  }

  static login(nickname) {
    let n = SaveSystem.normaliseNickname(nickname);
    if (!SaveSystem.isValidNickname(n)) return null;
    let profile = SaveSystem.loadProfile(n) || SaveSystem.defaultProfile(n);
    SaveSystem.saveProfile(profile);
    SaveSystem.setActiveNickname(n);
    return profile;
  }

  static logout() {
    try {
      localStorage.removeItem(SaveSystem.ACTIVE_PLAYER_KEY);
    } catch (e) {
      console.warn('[Save] Failed to logout:', e);
    }
  }

  static unlockNextLevel(profile, completedLevel) {
    if (!profile) return false;
    if (typeof completedLevel !== 'number') return false;

    let changed = false;
    profile.lastCompletedLevel = Math.max(profile.lastCompletedLevel || 0, completedLevel);

    // Unlock strictly after completion: beat level N → unlock level N+1 (capped)
    let target = Math.min(TOTAL_LEVELS, completedLevel + 1);
    if ((profile.unlockedUpTo || 1) < target) {
      profile.unlockedUpTo = target;
      changed = true;
    }

    profile.totalWins = (profile.totalWins || 0) + 1;
    changed = true;

    if (changed) SaveSystem.saveProfile(profile);
    return changed;
  }
}

