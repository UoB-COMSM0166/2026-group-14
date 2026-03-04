export function registerBalanceTests(TESTS, ctx = {}) {
  const getNumber = (v, fallback) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

  const defaults = {
    towers: {
      cannon: { cost: 100, dmg: 20, fireRate: 1.0, range: 160, splash: 0 },
      tesla: { cost: 140, dmg: 10, fireRate: 2.5, range: 140, splash: 0 },
      slow: { cost: 120, dmg: 4, fireRate: 1.5, range: 150, slowPct: 0.35, slowDuration: 1.8 }
    },
    enemies: {
      runner: { hp: 50, speed: 2.4, reward: 10 },
      tank: { hp: 180, speed: 1.2, reward: 25 },
      flyer: { hp: 70, speed: 2.8, reward: 14 }
    }
  };

  const data = {
    towers: ctx.towers ?? defaults.towers,
    enemies: ctx.enemies ?? defaults.enemies
  };

  const inRange = (v, min, max) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;

  const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
  };

  const assertKeys = (obj, keys, label) => {
    keys.forEach(k => assert(obj && Object.prototype.hasOwnProperty.call(obj, k), `${label} missing key: ${k}`));
  };

  const calcDPS = t => getNumber(t.dmg, 0) * getNumber(t.fireRate, 0);

  TESTS.add("Balance: towers exist", () => {
    assert(typeof data.towers === "object" && data.towers, "towers object missing");
    assert(Object.keys(data.towers).length >= 1, "no towers defined");
  });

  TESTS.add("Balance: enemies exist", () => {
    assert(typeof data.enemies === "object" && data.enemies, "enemies object missing");
    assert(Object.keys(data.enemies).length >= 1, "no enemies defined");
  });

  TESTS.add("Balance: tower fields + ranges", () => {
    for (const [name, t] of Object.entries(data.towers)) {
      assertKeys(t, ["cost", "dmg", "fireRate", "range"], `tower:${name}`);

      const cost = getNumber(t.cost, NaN);
      const dmg = getNumber(t.dmg, NaN);
      const fireRate = getNumber(t.fireRate, NaN);
      const range = getNumber(t.range, NaN);

      assert(inRange(cost, 10, 2000), `tower:${name} cost out of range: ${cost}`);
      assert(inRange(dmg, 0, 500), `tower:${name} dmg out of range: ${dmg}`);
      assert(inRange(fireRate, 0.1, 20), `tower:${name} fireRate out of range: ${fireRate}`);
      assert(inRange(range, 40, 600), `tower:${name} range out of range: ${range}`);

      const dps = calcDPS(t);
      assert(inRange(dps, 0.1, 2000), `tower:${name} DPS out of range: ${dps}`);
    }
  });

  TESTS.add("Balance: enemy fields + ranges", () => {
    for (const [name, e] of Object.entries(data.enemies)) {
      assertKeys(e, ["hp", "speed", "reward"], `enemy:${name}`);

      const hp = getNumber(e.hp, NaN);
      const speed = getNumber(e.speed, NaN);
      const reward = getNumber(e.reward, NaN);

      assert(inRange(hp, 1, 100000), `enemy:${name} hp out of range: ${hp}`);
      assert(inRange(speed, 0.1, 20), `enemy:${name} speed out of range: ${speed}`);
      assert(inRange(reward, 0, 10000), `enemy:${name} reward out of range: ${reward}`);
    }
  });

  TESTS.add("Balance: rewards not greater than HP (sanity)", () => {
    for (const [name, e] of Object.entries(data.enemies)) {
      const hp = getNumber(e.hp, 0);
      const reward = getNumber(e.reward, 0);
      assert(reward <= hp, `enemy:${name} reward (${reward}) > hp (${hp})`);
    }
  });

  TESTS.add("Balance: tower cost vs DPS (sanity)", () => {
    for (const [name, t] of Object.entries(data.towers)) {
      const cost = getNumber(t.cost, 1);
      const dps = calcDPS(t);
      const eff = dps / Math.max(1, cost);

      assert(inRange(eff, 0.01, 2.0), `tower:${name} DPS/cost efficiency out of range: ${eff}`);
    }
  });

  TESTS.add("Balance: slow tower has slow params", () => {
    if (!data.towers.slow) return;
    const t = data.towers.slow;
    assertKeys(t, ["slowPct", "slowDuration"], "tower:slow");
    const slowPct = getNumber(t.slowPct, NaN);
    const slowDuration = getNumber(t.slowDuration, NaN);
    assert(inRange(slowPct, 0.05, 0.9), `tower:slow slowPct out of range: ${slowPct}`);
    assert(inRange(slowDuration, 0.2, 10), `tower:slow slowDuration out of range: ${slowDuration}`);
  });

  TESTS.add("Balance: core matchup runner not impossible (rough)", () => {
    const runner = data.enemies.runner;
    const cannon = data.towers.cannon;
    if (!runner || !cannon) return;

    const runnerHP = getNumber(runner.hp, 50);
    const cannonDPS = calcDPS(cannon);

    assert(cannonDPS > 0, "cannon DPS must be > 0");

    const timeToKill = runnerHP / cannonDPS;
    assert(inRange(timeToKill, 0.2, 20), `runner TTK out of range: ${timeToKill}s`);
  });
}