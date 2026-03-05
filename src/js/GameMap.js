// ========================================
// GameMap — Map / grid (stub for teammate)
// ========================================

// ========================================


class GameMap {
  constructor() {
    // 1. 动态计算网格的行数和列数（防止窗口大小除不尽 60，使用 Math.floor 向下取整）
    this.cols = Math.floor(CANVAS_WIDTH / GRID_SIZE);
    this.rows = Math.floor(CANVAS_HEIGHT / GRID_SIZE);

    // 2. 初始化一个全屏的二维数组 (0 代表可放塔的草地)
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      let row = [];
      for (let x = 0; x < this.cols; x++) {
        row.push(0);
      }
      this.grid.push(row);
    }

    // 3. 在屏幕中间硬编码一条第一关的测试路径
    let pathRow = Math.floor(this.rows / 2); // 屏幕正中间的一行
    for (let x = 0; x < this.cols - 2; x++) {
      this.grid[pathRow][x] = 1; // 1 代表怪物走的泥土路
    }

    // 4. 设置终点地标（大本钟）的位置，放在小路的尽头
    this.landmarkPos = { x: this.cols - 2, y: pathRow };
    this.grid[this.landmarkPos.y][this.landmarkPos.x] = 2; // 2 代表地标建筑
  }

  // ==========================================
  // 视觉渲染：把数组变成画面
  // ==========================================
  draw() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let cellType = this.grid[y][x];

        // 根据格子类型填充颜色（第一周先不贴图，用颜色代替）
        if (cellType === 0) {
          fill(120, 200, 120); // 浅绿色：草地 (可建塔)
        } else if (cellType === 1) {
          fill(200, 180, 140); // 泥土色：怪物路径 (不可建塔)
        } else if (cellType === 2) {
          fill(255, 100, 100); // 红色：大本钟位置
        }

        stroke(255, 255, 255, 50); // 画半透明的白色网格线
        strokeWeight(1);

        // p5.js 的画矩形函数：rect(x坐标, y坐标, 宽度, 高度)
        rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      }
    }
  }

  // ==========================================
  // 数据接口
  // ==========================================

  // 1. 给怪物组：返回路径的像素坐标点 (需要返回格子的中心点坐标)
  getPath() {
    let waypoints = [];
    let pathRow = Math.floor(this.rows / 2);

    // 起点：屏幕最左边
    waypoints.push({
      x: 0 * GRID_SIZE + GRID_SIZE / 2,
      y: pathRow * GRID_SIZE + GRID_SIZE / 2
    });

    // 终点：大本钟的中心点
    waypoints.push({
      x: this.landmarkPos.x * GRID_SIZE + GRID_SIZE / 2,
      y: this.landmarkPos.y * GRID_SIZE + GRID_SIZE / 2
    });

    return waypoints;
  }

  // 2. 给交互/塔组：鼠标点中的格子能不能放塔
  isPlaceable(gridX, gridY) {
    // 边界安全检查，防止数组越界报错
    if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) {
      return false;
    }
    // 只有 0 (草地) 才能放塔
    return this.grid[gridY][gridX] === 0;
  }

  // 3. 给 UI / 游戏引擎组：获取地标状态
  getLandmark() {
    return {
      name: "大本钟",
      hp: LANDMARK_MAX_HP,     // 直接使用 constants.js 里的常量
      maxHp: LANDMARK_MAX_HP,
      gridX: this.landmarkPos.x,
      gridY: this.landmarkPos.y
    };
  }
}
