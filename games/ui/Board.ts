import Tile from './Tile';

export default class Board {
  private scene: Phaser.Scene;
  private gridSize: number = 6;
  private tileSize: number = 100;
  private boardWidth: number = 600; // 5 * 100
  private boardHeight: number = 600;
  private startX: number;
  private startY: number;
  private tiles: Map<string, Tile> = new Map();
  private isMoving: boolean = false;
  private swipeStartX: number = 0;
  private swipeStartY: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 800x800 화면의 중앙에 500x500 보드 배치
    // 시작 좌표 = (800 - 500) / 2 = 150
    this.startX = (800 - this.boardWidth) / 2;
    this.startY = (800 - this.boardHeight) / 2;
  }

  create() {
    this.drawGrid();

    this.tiles.clear();

    // 초기 타일 배치
    this.addTile(0, 0, 3);
    this.addRandomTile();

    this.setupInput();
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

  getTileKey(row: number, col: number): string {
    return `${row},${col}`;
  }

  getTile(row: number, col: number): Tile | null {
    return this.tiles.get(this.getTileKey(row, col)) || null;
  }

  setTile(row: number, col: number, tile: Tile | null) {
    const key = this.getTileKey(row, col);
    if (tile === null) {
      this.tiles.delete(key);
    } else {
      this.tiles.set(key, tile);
    }
  }

  removeTile(row: number, col: number) {
    this.tiles.delete(this.getTileKey(row, col));
  }

  // 특정 위치에 타일 추가
  addTile(row: number, col: number, value: number) {
    const imageKey = `tile_${value}`;
    const tile = new Tile({
      scene: this.scene,
      gridX: col,
      gridY: row,
      cellSize: this.tileSize,
      imageKey: imageKey,
      boardStartX: this.startX,
      boardStartY: this.startY,
      value: value,
    });

    tile.create();
    this.setTile(row, col, tile);
  }

  private addRandomTile() {
    const emptyCells: { row: number; col: number }[] = [];

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (!this.getTile(row, col)) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) {
      return;
    }

    // 3. 랜덤으로 빈 셀 선택
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];

    // 4. 80% 확률로 3, 20% 확률로 9
    const value = Math.random() < 0.8 ? 3 : 9;

    // 5. 타일 생성
    this.addTile(row, col, value);
  }

  // 이동
  moveLeft() {
    let moved = false;

    for (let row = 0; row < this.gridSize; row++) {
      // 현재 행의 타일들만 추출
      const rowTiles: Tile[] = [];
      for (let col = 0; col < this.gridSize; col++) {
        const tile = this.getTile(row, col);
        if (tile) {
          rowTiles.push(tile);
        }
      }

      // 행 초기화
      for (let col = 0; col < this.gridSize; col++) {
        this.removeTile(row, col);
      }

      // 왼쪽부터 재배치
      rowTiles.forEach((tile, index) => {
        if (tile.gridX !== index) {
          moved = true;
        }
        tile.gridX = index;
        tile.gridY = row;
        tile.moveTo(row, index);
        this.setTile(row, index, tile);
      });
    }

    return moved;
  }

  moveRight() {
    let moved = false;

    for (let row = 0; row < this.gridSize; row++) {
      const rowTiles: Tile[] = [];
      for (let col = 0; col < this.gridSize; col++) {
        const tile = this.getTile(row, col);
        if (tile) {
          rowTiles.push(tile);
        }
      }

      for (let col = 0; col < this.gridSize; col++) {
        this.removeTile(row, col);
      }

      // 오른쪽부터 배치
      rowTiles.forEach((tile, index) => {
        const targetCol = this.gridSize - rowTiles.length + index;
        if (tile.gridX !== targetCol) {
          moved = true;
        }
        tile.gridX = targetCol;
        tile.gridY = row;
        tile.moveTo(row, targetCol);
        this.setTile(row, targetCol, tile);
      });
    }

    return moved;
  }

  moveUp() {
    let moved = false;

    for (let col = 0; col < this.gridSize; col++) {
      const colTiles: Tile[] = [];
      for (let row = 0; row < this.gridSize; row++) {
        const tile = this.getTile(row, col);
        if (tile) {
          colTiles.push(tile);
        }
      }

      for (let row = 0; row < this.gridSize; row++) {
        this.removeTile(row, col);
      }

      // 위쪽부터 배치
      colTiles.forEach((tile, index) => {
        if (tile.gridY !== index) {
          moved = true;
        }
        tile.gridX = col;
        tile.gridY = index;
        tile.moveTo(index, col);
        this.setTile(index, col, tile);
      });
    }

    return moved;
  }

  moveDown() {
    let moved = false;

    for (let col = 0; col < this.gridSize; col++) {
      const colTiles: Tile[] = [];
      for (let row = 0; row < this.gridSize; row++) {
        const tile = this.getTile(row, col);
        if (tile) {
          colTiles.push(tile);
        }
      }

      for (let row = 0; row < this.gridSize; row++) {
        this.removeTile(row, col);
      }

      // 아래쪽부터 배치
      colTiles.forEach((tile, index) => {
        const targetRow = this.gridSize - colTiles.length + index;
        if (tile.gridY !== targetRow) {
          moved = true;
        }
        tile.gridX = col;
        tile.gridY = targetRow;
        tile.moveTo(targetRow, col);
        this.setTile(targetRow, col, tile);
      });
    }

    return moved;
  }

  private setupInput() {
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.isMoving) return;

      let moved = false;

      switch (event.key) {
        case 'ArrowLeft':
          moved = this.moveLeft();
          break;
        case 'ArrowRight':
          moved = this.moveRight();
          break;
        case 'ArrowUp':
          moved = this.moveUp();
          break;
        case 'ArrowDown':
          moved = this.moveDown();
          break;
      }

      if (moved) {
        this.isMoving = true;
        this.scene.time.delayedCall(250, () => {
          this.isMoving = false;
        });
      }
    });

    // 터치 스와이프
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isMoving) return;

      const deltaX = pointer.x - this.swipeStartX;
      const deltaY = pointer.y - this.swipeStartY;
      const minSwipeDistance = 50;

      if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        return;
      }

      let moved = false;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 가로 스와이프
        if (deltaX > 0) {
          moved = this.moveRight();
        } else {
          moved = this.moveLeft();
        }
      } else {
        // 세로 스와이프
        if (deltaY > 0) {
          moved = this.moveDown();
        } else {
          moved = this.moveUp();
        }
      }

      if (moved) {
        this.isMoving = true;
        this.scene.time.delayedCall(250, () => {
          this.isMoving = false;
        });
      }
    });
  }
}
