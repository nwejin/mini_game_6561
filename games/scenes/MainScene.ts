import * as Phaser from 'phaser';
import Board from '../ui/Board';

export default class MainScene extends Phaser.Scene {
  private board!: Board;

  constructor() {
    super('MainScene');
  }

  create() {
    this.board = new Board(this, (score) => {
      this.game.events.emit('scoreUpdate', score);
    });
    this.board.create();

    this.game.events.on('resetGame', () => {
      this.board.reset();
      this.game.events.emit('scoreReset'); // 점수도 초기화
    });
  }
}
