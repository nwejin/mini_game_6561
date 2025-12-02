import MainScene from './scenes/MainScene';
import LoadingScene from './scenes/LoadingScene';

export const GAME_WIDTH = 600;
export const GAME_HEIGHT = 600;

const Config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#333',
  scene: [LoadingScene, MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    touch: true,
    mouse: true,
    keyboard: true,
  },
};

export default Config;
