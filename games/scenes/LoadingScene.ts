import * as Phaser from 'phaser';

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    this.load.image('tile_blue', '/tile_blue.png');
    this.load.image('tile_red', '/tile_red.png');

    this.load.image('tile_orange', '/tile_orange.png');
  }

  create() {
    this.scene.start('MainScene');
  }
}
