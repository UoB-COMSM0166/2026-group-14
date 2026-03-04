export class BugLog {
  constructor(opts = {}) {
    this.items = [];
    this.maxItems = opts.maxItems ?? 200;
    this.persistKey = opts.persistKey ?? "defend-london-buglog";
    this.autoPersist = opts.autoPersist ?? true;
    this.sessionId = opts.sessionId ?? BugLog._newSessionId();
    this.includeConsole = opts.includeConsole ?? false;

    if (opts.loadOnStart ?? true) this.load();
  }

  addBug({
    title,
    steps = [],
    expected = "",
    actual = "",
    severity = "medium",
    area = "unknown",
    version = "v0",
    screenshot = "",
    notes = ""
  }) {
    const bug = {
      id: BugLog._newId(),
      createdAt: new Date().toISOString(),
      sessionId: this.sessionId,
      title: String(title ?? "").trim(),
      steps: Array.isArray(steps) ? steps.map(s => String(s)) : [String(steps)],
      expected: String(expected),
      actual: String(actual),
      severity: BugLog._normSeverity(severity),
      area: String(area),
      version: String(version),
      screenshot: String(screenshot),
      notes: String(notes),
      status: "open",
      tags: []
    };

    if (!bug.title) throw new Error("Bug title is required");

    this.items.unshift(bug);
    this._trim();
    if (this.autoPersist) this.save();
    return bug.id;
  }

  addTag(id, tag) {
    const bug = this.getById(id);
    if (!bug) return false;
    const t = String(tag ?? "").trim();
    if (!t) return false;
    if (!bug.tags.includes(t)) bug.tags.push(t);
    if (this.autoPersist) this.save();
    return true;
  }

  setStatus(id, status) {
    const bug = this.getById(id);
    if (!bug) return false;
    const s = String(status ?? "").toLowerCase();
    if (!["open", "in_progress", "fixed", "wont_fix", "duplicate"].includes(s)) return false;
    bug.status = s;
    if (this.autoPersist) this.save();
    return true;
  }

  updateBug(id, patch = {}) {
    const bug = this.getById(id);
    if (!bug) return false;

    if (patch.title !== undefined) bug.title = String(patch.title).trim();
    if (patch.steps !== undefined) bug.steps = Array.isArray(patch.steps) ? patch.steps.map(String) : [String(patch.steps)];
    if (patch.expected !== undefined) bug.expected = String(patch.expected);
    if (patch.actual !== undefined) bug.actual = String(patch.actual);
    if (patch.severity !== undefined) bug.severity = BugLog._normSeverity(patch.severity);
    if (patch.area !== undefined) bug.area = String(patch.area);
    if (patch.version !== undefined) bug.version = String(patch.version);
    if (patch.screenshot !== undefined) bug.screenshot = String(patch.screenshot);
    if (patch.notes !== undefined) bug.notes = String(patch.notes);
    if (patch.status !== undefined) this.setStatus(id, patch.status);

    if (!bug.title) throw new Error("Bug title cannot be empty");
    if (this.autoPersist) this.save();
    return true;
  }

  removeBug(id) {
    const idx = this.items.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    if (this.autoPersist) this.save();
    return true;
  }

  getById(id) {
    return this.items.find(b => b.id === id) ?? null;
  }

  list(filter = {}) {
    const severity = filter.severity ? BugLog._normSeverity(filter.severity) : null;
    const status = filter.status ? String(filter.status).toLowerCase() : null;
    const area = filter.area ? String(filter.area).toLowerCase() : null;
    const text = filter.text ? String(filter.text).toLowerCase() : null;

    return this.items.filter(b => {
      if (severity && b.severity !== severity) return false;
      if (status && b.status !== status) return false;
      if (area && String(b.area).toLowerCase() !== area) return false;
      if (text) {
        const hay = [
          b.title,
          b.expected,
          b.actual,
          b.notes,
          b.steps.join("\n"),
          b.tags.join(" ")
        ].join("\n").toLowerCase();
        if (!hay.includes(text)) return false;
      }
      return true;
    });
  }

  exportMarkdown({ limit = 50 } = {}) {
    const rows = this.items.slice(0, limit).map(b => {
      const steps = b.steps.length ? b.steps.map((s, i) => `${i + 1}. ${s}`).join("\n") : "";
      const tags = b.tags.length ? b.tags.map(t => `\`${t}\``).join(" ") : "";
      return [
        `### ${b.title}`,
        `- **ID:** ${b.id}`,
        `- **Created:** ${b.createdAt}`,
        `- **Status:** ${b.status}`,
        `- **Severity:** ${b.severity}`,
        `- **Area:** ${b.area}`,
        `- **Version:** ${b.version}`,
        tags ? `- **Tags:** ${tags}` : "",
        b.screenshot ? `- **Screenshot:** ${b.screenshot}` : "",
        steps ? `- **Steps to reproduce:**\n${steps}` : "",
        b.expected ? `- **Expected:** ${b.expected}` : "",
        b.actual ? `- **Actual:** ${b.actual}` : "",
        b.notes ? `- **Notes:** ${b.notes}` : ""
      ].filter(Boolean).join("\n");
    });

    return [
      "# Bug Log",
      `Generated: ${new Date().toISOString()}`,
      "",
      ...rows
    ].join("\n\n");
  }

  save() {
    try {
      const payload = {
        sessionId: this.sessionId,
        savedAt: new Date().toISOString(),
        items: this.items
      };
      localStorage.setItem(this.persistKey, JSON.stringify(payload));
      return true;
    } catch (e) {
      if (this.includeConsole) console.warn("BugLog save failed:", e);
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(this.persistKey);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.items)) return false;
      this.items = parsed.items;
      this._trim();
      return true;
    } catch (e) {
      if (this.includeConsole) console.warn("BugLog load failed:", e);
      return false;
    }
  }

  clear() {
    this.items = [];
    if (this.autoPersist) this.save();
  }

  _trim() {
    if (this.items.length > this.maxItems) this.items.length = this.maxItems;
  }

  static _normSeverity(s) {
    const v = String(s ?? "").toLowerCase();
    if (["low", "medium", "high", "critical"].includes(v)) return v;
    return "medium";
  }

  static _newId() {
    const rand = Math.random().toString(16).slice(2, 10);
    const t = Date.now().toString(16);
    return `BUG-${t}-${rand}`.toUpperCase();
  }

  static _newSessionId() {
    const rand = Math.random().toString(16).slice(2, 10);
    return `SESSION-${Date.now().toString(16)}-${rand}`.toUpperCase();
  }
}