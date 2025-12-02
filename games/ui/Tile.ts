interface TileConfigs {
  scene: Phaser.Scene;
  gridX: number;
  gridY: number;
  cellSize: number;
  imageKey: string;
  boardStartX: number;
  boardStartY: number;
  value: number;
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
  value: number;

  constructor(configs: TileConfigs) {
    this.scene = configs.scene;
    this.gridX = configs.gridX;
    this.gridY = configs.gridY;
    this.cellSize = configs.cellSize;
    this.imageKey = configs.imageKey;
    this.boardStartX = configs.boardStartX;
    this.boardStartY = configs.boardStartY;
    this.value = configs.value;
  }

  create() {
    // 타일의 화면상 실제 위치 계산
    const x = this.boardStartX + this.gridX * this.cellSize + this.cellSize / 2;
    const y = this.boardStartY + this.gridY * this.cellSize + this.cellSize / 2;

    // 이미지 생성
    this.image = this.scene.add.image(x, y, this.imageKey);
    this.image.setDisplaySize(this.cellSize, this.cellSize);

    // 등장 애니메이션
    this.image.setScale(0);
    this.scene.tweens.add({
      targets: this.image,
      scale: 0.68,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  destroy() {
    if (this.image) {
      this.image.destroy();
      this.image = null;
    }
  }

  moveTo(row: number, col: number) {
    const x = this.boardStartX + col * this.cellSize + this.cellSize / 2;
    const y = this.boardStartY + row * this.cellSize + this.cellSize / 2;

    this.scene.tweens.add({
      targets: this.image,
      x: x,
      y: y,
      duration: 200,
      ease: 'Power2',
    });
  }
}
