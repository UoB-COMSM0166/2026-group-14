export class AssetManager {
  constructor(opts = {}) {
    this.p = opts.p ?? null;
    this.manifestPath = opts.manifestPath ?? "assets_manifest.json";
    this.manifest = null;

    this.images = new Map();
    this.audio = new Map();

    this.imageErrors = [];
    this.audioErrors = [];

    this.loaded = {
      manifest: false,
      images: false,
      audio: false
    };
  }

  preloadManifest(path) {
    this.manifestPath = path ?? this.manifestPath;
    this.manifest = this.p.loadJSON(this.manifestPath);
    this.loaded.manifest = true;
  }

  preloadImages() {
    if (!this.manifest || !this.manifest.images) {
      this.images.clear();
      this.loaded.images = false;
      return;
    }

    const items = this._flatten(this.manifest.images, "images");
    items.forEach(({ key, path }) => {
      this.images.set(
        key,
        this.p.loadImage(
          path,
          () => {},
          () => this.imageErrors.push({ key, path, error: "loadImage failed" })
        )
      );
    });

    this.loaded.images = true;
  }

  preloadAudio() {
    if (!this.manifest || !this.manifest.audio) {
      this.audio.clear();
      this.loaded.audio = false;
      return;
    }

    if (typeof this.p.loadSound !== "function") {
      this.audioErrors.push({ key: "audio", path: "", error: "p5.sound not loaded" });
      this.loaded.audio = false;
      return;
    }

    const items = this._flatten(this.manifest.audio, "audio");
    items.forEach(({ key, path }) => {
      this.audio.set(
        key,
        this.p.loadSound(
          path,
          () => {},
          () => this.audioErrors.push({ key, path, error: "loadSound failed" })
        )
      );
    });

    this.loaded.audio = true;
  }

  getImage(key) {
    return this.images.get(key) ?? null;
  }

  getAudio(key) {
    return this.audio.get(key) ?? null;
  }

  hasImage(key) {
    return this.images.has(key);
  }

  hasAudio(key) {
    return this.audio.has(key);
  }

  listImageKeys(prefix = "") {
    const out = [];
    for (const k of this.images.keys()) if (!prefix || k.startsWith(prefix)) out.push(k);
    return out;
  }

  listAudioKeys(prefix = "") {
    const out = [];
    for (const k of this.audio.keys()) if (!prefix || k.startsWith(prefix)) out.push(k);
    return out;
  }

  getStatus() {
    return {
      manifestPath: this.manifestPath,
      manifestLoaded: !!this.manifest,
      imagesLoaded: this.loaded.images,
      audioLoaded: this.loaded.audio,
      imageCount: this.images.size,
      audioCount: this.audio.size,
      imageErrors: [...this.imageErrors],
      audioErrors: [...this.audioErrors]
    };
  }

  _flatten(obj, prefix) {
    const items = [];

    const walk = (node, keyPrefix) => {
      if (typeof node === "string") {
        items.push({ key: keyPrefix, path: node });
        return;
      }

      if (Array.isArray(node)) {
        node.forEach((p, i) => items.push({ key: `${keyPrefix}[${i}]`, path: p }));
        return;
      }

      if (node && typeof node === "object") {
        for (const k of Object.keys(node)) {
          walk(node[k], keyPrefix ? `${keyPrefix}.${k}` : k);
        }
      }
    };

    walk(obj, prefix);
    return items;
  }
}