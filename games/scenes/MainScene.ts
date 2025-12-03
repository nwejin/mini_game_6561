import * as Phaser from 'phaser';
import Board from '../ui/Board';

export default class MainScene extends Phaser.Scene {
  private board!: Board;
  private onResetGame?: () => void;

  constructor() {
    super('MainScene');
  }

  create() {
    // Registry에서 콜백 가져오기
    const onScoreUpdate = this.game.registry.get('onScoreUpdate');
    const onResetGame = this.game.registry.get('onResetGame');

    this.board = new Board(this, onScoreUpdate);
    this.board.create();

    this.onResetGame = onResetGame;
  }

  resetGame() {
    this.board.reset();
    this.onResetGame?.();
  }
}
