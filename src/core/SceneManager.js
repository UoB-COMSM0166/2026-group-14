export class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.current = null;
    this.currentName = "";
  }

  add(name, scene) {
    if (typeof name !== "string" || !name.trim()) throw new Error("Scene name must be a non-empty string");
    if (!scene) throw new Error("Scene is required");
    if (this.scenes.has(name)) throw new Error(`Scene already exists: ${name}`);

    const required = ["enter", "exit", "update", "render"];
    for (const fn of required) {
      if (typeof scene[fn] !== "function") {
        throw new Error(`Scene "${name}" missing function: ${fn}()`);
      }
    }

    this.scenes.set(name, scene);
    return this;
  }

  has(name) {
    return this.scenes.has(name);
  }

  get(name) {
    return this.scenes.get(name) ?? null;
  }

  start(name, ctx = {}) {
    if (!this.scenes.has(name)) throw new Error(`Unknown scene: ${name}`);
    if (this.current) {
      this.current.exit(ctx);
    }
    this.currentName = name;
    this.current = this.scenes.get(name);
    this.current.enter(ctx);
  }

  switchTo(name, ctx = {}) {
    this.start(name, ctx);
  }

  update(dt, ctx = {}) {
    if (!this.current) return;
    this.current.update(dt, ctx);
  }

  render(p, ctx = {}) {
    if (!this.current) return;
    this.current.render(p, ctx);
  }

  keyPressed(p, ctx = {}) {
    if (!this.current) return false;
    if (typeof this.current.keyPressed !== "function") return false;
    return !!this.current.keyPressed(p, ctx);
  }

  keyReleased(p, ctx = {}) {
    if (!this.current) return false;
    if (typeof this.current.keyReleased !== "function") return false;
    return !!this.current.keyReleased(p, ctx);
  }

  mousePressed(p, ctx = {}) {
    if (!this.current) return false;
    if (typeof this.current.mousePressed !== "function") return false;
    return !!this.current.mousePressed(p, ctx);
  }

  mouseReleased(p, ctx = {}) {
    if (!this.current) return false;
    if (typeof this.current.mouseReleased !== "function") return false;
    return !!this.current.mouseReleased(p, ctx);
  }

  mouseMoved(p, ctx = {}) {
    if (!this.current) return false;
    if (typeof this.current.mouseMoved !== "function") return false;
    return !!this.current.mouseMoved(p, ctx);
  }

  mouseDragged(p, ctx = {}) {
    if (!this.current) return false;
    if (typeof this.current.mouseDragged !== "function") return false;
    return !!this.current.mouseDragged(p, ctx);
  }

  wheel(p, ctx = {}) {
    if (!this.current) return false;
    if (typeof this.current.wheel !== "function") return false;
    return !!this.current.wheel(p, ctx);
  }
}