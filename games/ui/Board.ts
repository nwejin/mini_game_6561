export default class Board {
  private scene: Phaser.Scene;
  private gridSize: number = 6;
  private tileSize: number = 100;
  private boardWidth: number = 600; // 5 * 100
  private boardHeight: number = 600;
  private startX: number;
  private startY: number;
  private tiles: (Phaser.GameObjects.Image | null)[][] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 800x800 화면의 중앙에 500x500 보드 배치
    // 시작 좌표 = (800 - 500) / 2 = 150
    this.startX = (800 - this.boardWidth) / 2;
    this.startY = (800 - this.boardHeight) / 2;
  }

  create() {
    this.drawGrid();

    // 5x5 그리드 초기화 (빈 셀로)
    for (let row = 0; row < this.gridSize; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.tiles[row][col] = null; // 빈 셀
      }
    }

    // 초기 타일 배치
    this.addTile(0, 0, 'tile_blue');
    this.addTile(0, 1, 'tile_red');
    this.addTile(0, 2, 'tile_orange');
  }

  // 그리드 선 그리기
  private drawGrid() {
    const gridGraphics = this.scene.add.graphics();
    gridGraphics.lineStyle(2, 0xffffff, 1); // 선 두께 2px, 흰색

    // 세로줄 (6개: 0, 1, 2, 3, 4, 5)
    for (let col = 0; col <= this.gridSize; col++) {
      const lineX = this.startX + col * this.tileSize;
      gridGraphics.lineBetween(lineX, this.startY, lineX, this.startY + this.boardHeight);
    }

    // 가로줄 (6개: 0, 1, 2, 3, 4, 5)
    for (let row = 0; row <= this.gridSize; row++) {
      const lineY = this.startY + row * this.tileSize;
      gridGraphics.lineBetween(this.startX, lineY, this.startX + this.boardWidth, lineY);
    }
  }

  // 특정 위치에 타일 추가
  addTile(row: number, col: number, tileKey: string) {
    // 타일 중심 위치 계산
    const x = this.startX + col * this.tileSize + this.tileSize / 2;
    const y = this.startY + row * this.tileSize + this.tileSize / 2;

    // 타일 생성
    const tile = this.scene.add.image(x, y, tileKey);
    tile.setDisplaySize(this.tileSize, this.tileSize);

    this.tiles[row][col] = tile;
  }

  // 특정 위치의 타일 가져오기
  getTile(row: number, col: number): Phaser.GameObjects.Image | null {
    return this.tiles[row][col];
  }
}
