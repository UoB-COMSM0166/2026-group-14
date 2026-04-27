# Game Engine MVP - Getting Started

> **The Game Engine MVP is complete and available on the `develop` branch.**
> Everyone can now begin working on their respective modules.

---

## How to Get Started

1. **Pull the `develop` branch:**

   ```bash
   git fetch origin
   git checkout develop
   git pull origin develop
   ```

2. **Create your own feature branch from `develop`:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Develop on your branch**

4. **Merge back into `develop` when complete**

---

## Module Assignments & Files

| Module           | Files to Modify                                                |
| ---------------- | -------------------------------------------------------------- |
| **Tower System** | `game/js/Tower.js` (modify `draw`, `update`, `attack` methods) |
| **Enemy System** | `game/js/Enemy.js` + `game/js/WaveManager.js`                  |
| **Map System**   | `game/js/GameMap.js` + `game/js/Path.js`                       |
| **UI System**    | `game/js/UIHUD.js` + `game/style.css`                          |

---

## Off-Limits Files (Maintained by Lead)

>  **Do NOT modify the following files:**

- `game/js/GameManager.js`
- `game/js/Economy.js`
- `game/js/Landmark.js`
- `game/js/constants.js`

---

## Engine API Reference

### GameManager

```js
game.getState()          // Get current game state
game.economy.getGold()   // Get current gold
game.economy.addGold(n)  // Add gold
game.landmark.hp         // Landmark hit points
game.towers              // Array of towers
game.enemies             // Array of enemies
```

### State Constants

```js
GameState.MENU
GameState.PLAYING
GameState.PAUSED
GameState.WIN
GameState.LOSE
```

### Configuration Constants (defined in `constants.js`)

```js
CANVAS_WIDTH       // Canvas width
CANVAS_HEIGHT      // Canvas height
GRID_SIZE          // Grid cell size
INITIAL_GOLD       // Starting gold amount
TOWER_COST         // Cost to place a tower
ENEMY_REACH_DAMAGE // Damage when enemy reaches landmark
```

---


