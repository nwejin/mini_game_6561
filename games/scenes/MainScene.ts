import * as Phaser from 'phaser';
import Board from '../ui/Board';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    // // 파란 타일: 이미지의 '중심'이 (0, 0)에 위치 (기본 동작)
    // const tile_blue = this.add.image(0, 0, 'tile_blue');
    // tile_blue.setDisplaySize(200, 200);

    // // 빨간 타일: 이미지의 '왼쪽 상단'이 (400, 100)에 위치하도록
    // const tile_red = this.add.image(400, 100, 'tile_red');
    // tile_red.setOrigin(0, 0); // 기준점을 왼쪽 상단으로 변경
    // tile_red.setDisplaySize(100, 100);

    // // 오렌지 타일: 이미지의 '중심'이 (600, 100)에 위치 (명시적으로 설정)
    // const tile_orange = this.add.image(600, 100, 'tile_orange');
    // tile_orange.setOrigin(0.5, 0.5); // 기준점을 중심으로 설정 (기본값)
    // tile_orange.setDisplaySize(100, 100);

    const board = new Board(this, (score) => {
      this.game.events.emit('scoreUpdate', score);
    });

    board.create();
  }
}
