export class TestRunner {
  constructor(opts = {}) {
    this.tests = [];
    this.enabled = opts.enabled ?? true;
    this.failFast = opts.failFast ?? false;
    this.onResult = typeof opts.onResult === "function" ? opts.onResult : null;
  }

  add(name, fn, meta = {}) {
    if (typeof name !== "string" || !name.trim()) throw new Error("Test name must be a non-empty string");
    if (typeof fn !== "function") throw new Error("Test function must be a function");
    this.tests.push({ name, fn, meta });
  }

  clear() {
    this.tests = [];
  }

  runAll(context = {}) {
    if (!this.enabled) {
      const summary = {
        total: this.tests.length,
        passed: 0,
        failed: 0,
        skipped: this.tests.length,
        results: [],
        startedAt: Date.now(),
        endedAt: Date.now()
      };
      if (this.onResult) this.onResult(summary);
      return summary;
    }

    const results = [];
    const startedAt = Date.now();
    let passed = 0;
    let failed = 0;

    console.group("=== Test Runner ===");

    for (const t of this.tests) {
      const r = {
        name: t.name,
        pass: false,
        error: null,
        meta: t.meta ?? {},
        durationMs: 0
      };

      const t0 = performance.now ? performance.now() : Date.now();
      try {
        t.fn(context);
        r.pass = true;
        passed++;
        console.log(`✅ PASS: ${t.name}`);
      } catch (e) {
        r.pass = false;
        failed++;
        r.error = e instanceof Error ? { message: e.message, stack: e.stack } : { message: String(e), stack: null };
        console.error(`❌ FAIL: ${t.name}`, e);
        if (this.failFast) {
          const t1 = performance.now ? performance.now() : Date.now();
          r.durationMs = Math.max(0, t1 - t0);
          results.push(r);
          break;
        }
      }
      const t1 = performance.now ? performance.now() : Date.now();
      r.durationMs = Math.max(0, t1 - t0);
      results.push(r);
    }

    console.log(`Result: ${passed}/${this.tests.length} passed`);
    console.groupEnd();

    const endedAt = Date.now();
    const summary = {
      total: this.tests.length,
      passed,
      failed,
      skipped: this.tests.length - passed - failed,
      results,
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt
    };

    if (this.onResult) this.onResult(summary);
    return summary;
  }

  static assert(condition, message = "Assertion failed") {
    if (!condition) throw new Error(message);
  }

  static assertEqual(actual, expected, message = "Expected values to be equal") {
    if (actual !== expected) throw new Error(`${message}. actual=${actual} expected=${expected}`);
  }

  static assertInRange(value, min, max, message = "Expected value to be in range") {
    if (typeof value !== "number" || value < min || value > max) {
      throw new Error(`${message}. value=${value} range=[${min}, ${max}]`);
    }
  }
}