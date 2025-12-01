import * as Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    const text = this.add.text(400, 300, 'Hello, Phaser!', {
      fontSize: '32px',
      color: '#ffffff',
    });
    text.setOrigin(0.5);
  }
}
