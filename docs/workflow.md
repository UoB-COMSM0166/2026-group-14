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
| **Tower System** | `src/js/Tower.js` (modify `draw`, `update`, `attack` methods) |
| **Enemy System** | `src/js/Enemy.js` + `src/js/WaveManager.js`                   |
| **Map System**   | `src/js/GameMap.js` + `src/js/Path.js`                        |
| **UI System**    | `src/js/UIHUD.js` + `src/css/style.css`                       |

---

## Off-Limits Files (Maintained by Lead)

>  **Do NOT modify the following files:**

- `src/js/GameManager.js`
- `src/js/Economy.js`
- `src/js/Landmark.js`
- `src/js/constants.js`

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

## Questions?

If you have any questions, feel free to reach out to the project lead anytime!
