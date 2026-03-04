export class UIOverlay {
  constructor(opts = {}) {
    this.width = opts.width ?? 800;
    this.height = opts.height ?? 600;

    this.topBarHeight = opts.topBarHeight ?? 40;
    this.sidePanelWidth = opts.sidePanelWidth ?? 240;

    this.showTopBar = opts.showTopBar ?? true;
    this.showRightPanel = opts.showRightPanel ?? false;

    this.state = {
      mode: "Default Brush",
      colorName: "Red",
      sizePx: 10,
      showGrid: false,
      assetStatus: { manifest: false, loadedImages: 0, errors: [] },
      hints: "1-9=Colors | +/-=Size | E=Eraser | P=Spray | Space=Clear | S=Save | G=Grid | L=Assets | T=Tests"
    };

    this.preview = {
      title: "Assets Preview",
      items: []
    };
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  setShowRightPanel(v) {
    this.showRightPanel = !!v;
  }

  setShowTopBar(v) {
    this.showTopBar = !!v;
  }

  setState(partial) {
    this.state = { ...this.state, ...partial };
  }

  setAssetStatus({ manifest, loadedImages, errors }) {
    this.state.assetStatus = {
      manifest: !!manifest,
      loadedImages: Number.isFinite(loadedImages) ? loadedImages : 0,
      errors: Array.isArray(errors) ? errors : []
    };
  }

  setPreviewItems(items) {
    this.preview.items = Array.isArray(items) ? items : [];
  }

  setPreviewTitle(title) {
    this.preview.title = String(title ?? "");
  }

  drawTopBar(p) {
    if (!this.showTopBar) return;

    p.push();
    p.noStroke();
    p.fill(255);
    p.rect(0, 0, this.width, this.topBarHeight);

    p.fill(0);
    p.textSize(14);
    p.text(this.state.hints, 20, 15);

    const gridText = this.state.showGrid ? "ON" : "OFF";
    p.text(
      `Mode: ${this.state.mode} | Color: ${this.state.colorName} | Size: ${this.state.sizePx}px | Grid: ${gridText}`,
      20,
      35
    );
    p.pop();
  }

  drawRightPanel(p) {
    if (!this.showRightPanel) return;

    const panelX = this.width - this.sidePanelWidth;
    const panelY = this.topBarHeight + 10;
    const panelH = this.height - panelY - 10;

    p.push();
    p.fill(255);
    p.stroke(0);
    p.rect(panelX + 10, panelY, this.sidePanelWidth - 20, panelH, 8);

    p.noStroke();
    p.fill(0);
    p.textSize(12);
    p.text(this.preview.title, panelX + 20, panelY + 20);

    let y = panelY + 35;
    const x = panelX + 20;
    const thumb = 80;
    const gap = 12;

    for (let i = 0; i < this.preview.items.length; i++) {
      const it = this.preview.items[i];
      const label = it.label ?? `item${i}`;
      const key = it.key ?? "";
      const img = it.img ?? null;

      p.fill(0);
      p.text(`${label}: ${img ? "ok" : "none"}`, x, y);

      if (img) {
        p.image(img, x, y + 10, thumb, thumb);
        p.textSize(10);
        p.text(key, x + thumb + 10, y + 30, this.sidePanelWidth - 60 - thumb, 70);
        p.textSize(12);
      }

      y += thumb + gap + 10;
      if (y > panelY + panelH - 120) break;
    }

    const s = this.state.assetStatus;
    y = panelY + panelH - 70;
    p.fill(0);
    p.text(`manifest: ${s.manifest ? "ok" : "missing"}`, x, y);
    p.text(`loaded imgs: ${s.loadedImages}`, x, y + 16);

    if (s.errors && s.errors.length) {
      p.text("errors:", x, y + 32);
      p.textSize(10);
      p.text(s.errors.slice(0, 3).join(" | "), x, y + 46, this.sidePanelWidth - 40, 40);
      p.textSize(12);
    }

    p.pop();
  }

  draw(p) {
    this.drawTopBar(p);
    this.drawRightPanel(p);
  }
}