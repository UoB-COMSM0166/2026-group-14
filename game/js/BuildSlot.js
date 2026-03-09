class BuildSlot {
  constructor(id, x, y) {
    this.id = id;
    this.position = createVector(x, y);
    this.occupied = false;
  }
}
