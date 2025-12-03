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
    const onStartTimer = this.game.registry.get('onStartTimer');
    const onGameOver = this.game.registry.get('onGameOver');

    const configs = {
      scene: this,
      onScoreUpdate,
      onGameOver,
    };

    this.board = new Board(configs);
    this.board.create();

    this.onResetGame = onResetGame;

    if (onStartTimer) {
      onStartTimer();
    }
  }

  resetGame() {
    this.board.reset();
    this.onResetGame?.();
  }
}
