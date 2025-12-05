import Tile from './Tile';
import { GAME_WIDTH, GAME_HEIGHT } from '../Config';

interface BoardConfigs {
  scene: Phaser.Scene;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (reason: 'win' | 'lose') => void;
}

export default class Board {
  private scene: Phaser.Scene;
  private gridSize: number = 4;
  private tileSize: number = 140;
  private boardWidth: number = 560; // 5 * 100
  private boardHeight: number = 560;
  private startX: number;
  private startY: number;
  private tiles: Map<string, Tile> = new Map();
  private isMoving: boolean = false;
  private swipeStartX: number = 0;
  private swipeStartY: number = 0;

  private onScoreUpdate?: (score: number) => void;
  private onGameOver?: (reason: 'win' | 'lose') => void;
  private isGameOver: boolean = false;

  constructor(configs: BoardConfigs) {
    this.scene = configs.scene;

    this.onScoreUpdate = configs.onScoreUpdate;
    this.onGameOver = configs.onGameOver;

    // 800x800 화면의 중앙에 500x500 보드 배치
    // 시작 좌표 = (800 - 500) / 2 = 150
    this.startX = (GAME_WIDTH - this.boardWidth) / 2;
    this.startY = (GAME_HEIGHT - this.boardHeight) / 2;
  }

  create() {
    this.drawGrid();

    this.tiles.clear();

    // 초기 타일 배치
    this.addTile(0, 0, 3);
    this.addRandomTile();

    this.setupInput();
  }

  reset() {
    this.isGameOver = false;

    // 기존 타일들 모두 제거
    this.tiles.forEach((tile) => tile.destroy());
    this.tiles.clear();

    // 초기 타일 배치
    this.addTile(0, 0, 3);
    this.addRandomTile();
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

    // 4. 90% 확률로 3, 10% 확률로 9
    const value = Math.random() < 0.9 ? 3 : 9;

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

      let targetCol = 0;
      let i = 0;

      while (i < rowTiles.length) {
        const currentTile = rowTiles[i];
        const nextTile = rowTiles[i + 1];

        // 다음 타일이 있고 같은 값이면 합치기
        if (nextTile && currentTile.value === nextTile.value) {
          // 합쳐진 새 타일 생성
          const newValue = currentTile.value * 3;
          this.addTile(row, targetCol, newValue);

          if (this.onScoreUpdate) {
            this.onScoreUpdate(newValue);
          }

          // 기존 타일 2개 제거
          currentTile.destroy();
          nextTile.destroy();

          moved = true;
          targetCol++;
          i += 2; // 두 타일 소비
        } else {
          // 그냥 이동
          if (currentTile.gridX !== targetCol || currentTile.gridY !== row) {
            moved = true;
          }
          currentTile.gridX = targetCol;
          currentTile.gridY = row;
          currentTile.moveTo(row, targetCol);
          this.setTile(row, targetCol, currentTile);
          targetCol++;
          i++;
        }
      }
    }

    if (moved) {
      this.addRandomTile();

      if (this.has19683()) {
        this.isGameOver = true;
        this.onGameOver?.('win');
        return moved;
      }

      // 게임 오버 체크
      if (!this.canMakeMove()) {
        this.isGameOver = true;
        this.onGameOver?.('lose');
      }
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

      // 오른쪽부터 배치 + 합치기 (역순 처리)
      let targetCol = this.gridSize - 1;
      let i = rowTiles.length - 1;

      while (i >= 0) {
        const currentTile = rowTiles[i];
        const prevTile = rowTiles[i - 1];

        // 이전 타일이 있고 같은 값이면 합치기
        if (prevTile && currentTile.value === prevTile.value) {
          const newValue = currentTile.value * 3;
          this.addTile(row, targetCol, newValue);

          if (this.onScoreUpdate) {
            this.onScoreUpdate(newValue);
          }

          currentTile.destroy();
          prevTile.destroy();

          moved = true;
          targetCol--;
          i -= 2;
        } else {
          if (currentTile.gridX !== targetCol || currentTile.gridY !== row) {
            moved = true;
          }
          currentTile.gridX = targetCol;
          currentTile.gridY = row;
          currentTile.moveTo(row, targetCol);
          this.setTile(row, targetCol, currentTile);
          targetCol--;
          i--;
        }
      }
    }

    if (moved) {
      this.addRandomTile();

      if (this.has19683()) {
        this.isGameOver = true;
        this.onGameOver?.('win');
        return moved;
      }

      // 게임 오버 체크
      if (!this.canMakeMove()) {
        this.isGameOver = true;
        this.onGameOver?.('lose');
      }
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

      // 위쪽부터 배치 + 합치기
      let targetRow = 0;
      let i = 0;

      while (i < colTiles.length) {
        const currentTile = colTiles[i];
        const nextTile = colTiles[i + 1];

        if (nextTile && currentTile.value === nextTile.value) {
          const newValue = currentTile.value * 3;
          this.addTile(targetRow, col, newValue);

          if (this.onScoreUpdate) {
            this.onScoreUpdate(newValue);
          }

          currentTile.destroy();
          nextTile.destroy();

          moved = true;
          targetRow++;
          i += 2;
        } else {
          if (currentTile.gridY !== targetRow || currentTile.gridX !== col) {
            moved = true;
          }
          currentTile.gridX = col;
          currentTile.gridY = targetRow;
          currentTile.moveTo(targetRow, col);
          this.setTile(targetRow, col, currentTile);
          targetRow++;
          i++;
        }
      }
    }

    if (moved) {
      this.addRandomTile();

      if (this.has19683()) {
        this.isGameOver = true;
        this.onGameOver?.('win');
        return moved;
      }

      // 게임 오버 체크
      if (!this.canMakeMove()) {
        this.isGameOver = true;
        this.onGameOver?.('lose');
      }
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

      // 아래쪽부터 배치 + 합치기 (역순 처리)
      let targetRow = this.gridSize - 1;
      let i = colTiles.length - 1;

      while (i >= 0) {
        const currentTile = colTiles[i];
        const prevTile = colTiles[i - 1];

        if (prevTile && currentTile.value === prevTile.value) {
          const newValue = currentTile.value * 3;
          this.addTile(targetRow, col, newValue);

          if (this.onScoreUpdate) {
            this.onScoreUpdate(newValue);
          }

          currentTile.destroy();
          prevTile.destroy();

          moved = true;
          targetRow--;
          i -= 2;
        } else {
          if (currentTile.gridY !== targetRow || currentTile.gridX !== col) {
            moved = true;
          }
          currentTile.gridX = col;
          currentTile.gridY = targetRow;
          currentTile.moveTo(targetRow, col);
          this.setTile(targetRow, col, currentTile);
          targetRow--;
          i--;
        }
      }
    }

    if (moved) {
      this.addRandomTile();

      if (this.has19683()) {
        this.isGameOver = true;
        this.onGameOver?.('win');
        return moved;
      }

      // 게임 오버 체크
      if (!this.canMakeMove()) {
        this.isGameOver = true;
        this.onGameOver?.('lose');
      }
    }

    return moved;
  }

  private setupInput() {
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.isMoving || this.isGameOver) return;

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

  private has19683(): boolean {
    for (const tile of this.tiles.values()) {
      if (tile.value === 19683) return true;
    }
    return false;
  }

  private canMakeMove(): boolean {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize - 1; col++) {
        const tile1 = this.getTile(row, col);
        const tile2 = this.getTile(row, col + 1);
        if (!tile1 || !tile2) return true;
        if (tile1.value === tile2.value) return true;
      }
    }

    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize - 1; row++) {
        const tile1 = this.getTile(row, col);
        const tile2 = this.getTile(row + 1, col);
        if (!tile1 || !tile2) return true;
        if (tile1.value === tile2.value) return true;
      }
    }
    return false;
  }
}
