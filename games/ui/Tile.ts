interface TileConfigs {
  scene: Phaser.Scene;
  gridX: number;
  gridY: number;
  cellSize: number;
  imageKey: string;
  boardStartX: number;
  boardStartY: number;
}

export default class Tile {
  scene: Phaser.Scene;
  gridX: number;
  gridY: number;
  cellSize: number;
  imageKey: string;
  boardStartX: number;
  boardStartY: number;
  image: Phaser.GameObjects.Image | null = null;

  constructor(configs: TileConfigs) {
    this.scene = configs.scene;
    this.gridX = configs.gridX;
    this.gridY = configs.gridY;
    this.cellSize = configs.cellSize;
    this.imageKey = configs.imageKey;
    this.boardStartX = configs.boardStartX;
    this.boardStartY = configs.boardStartY;
  }

  create() {
    // 타일의 화면상 실제 위치 계산
    const x = this.boardStartX + this.gridX * this.cellSize + this.cellSize / 2;
    const y = this.boardStartY + this.gridY * this.cellSize + this.cellSize / 2;

    // 이미지 생성
    this.image = this.scene.add.image(x, y, this.imageKey);
    this.image.setDisplaySize(this.cellSize, this.cellSize);
  }

  destroy() {
    if (this.image) {
      this.image.destroy();
      this.image = null;
    }
  }
}
