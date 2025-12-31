import * as Phaser from 'phaser';
import Board from '../ui/Board';
import { GameMode } from '../configs/BoardConfigs';

export default class MainScene extends Phaser.Scene {
  private board!: Board;
  private onResetGame?: () => void;

  constructor() {
    super('MainScene');
  }

  create() {
    // Registry에서 콜백 및 설정 가져오기
    const onScoreUpdate = this.game.registry.get('onScoreUpdate');
    const onResetGame = this.game.registry.get('onResetGame');
    const onStartTimer = this.game.registry.get('onStartTimer');
    const onGameOver = this.game.registry.get('onGameOver');
    const gameMode = this.game.registry.get('gameMode');

    const configs = {
      scene: this,
      gameMode,
      onScoreUpdate,
      onGameOver,
      onStartTimer,
    };

    this.board = new Board(configs);
    this.board.create();

    this.onResetGame = onResetGame;
  }

  resetGame() {
    this.board.reset();
    this.onResetGame?.();
  }

  changeGameMode(newGameMode: GameMode) {
    // 기존 보드 제거
    this.board.destroy();

    // 새 게임 모드 설정
    this.game.registry.set('gameMode', newGameMode);

    // Registry에서 콜백 및 설정 가져오기
    const onScoreUpdate = this.game.registry.get('onScoreUpdate');
    const onGameOver = this.game.registry.get('onGameOver');
    const onStartTimer = this.game.registry.get('onStartTimer');

    const configs = {
      scene: this,
      gameMode: newGameMode,
      onScoreUpdate,
      onGameOver,
      onStartTimer,
    };

    // 새 보드 생성
    this.board = new Board(configs);
    this.board.create();
  }
}
