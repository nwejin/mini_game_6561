import MainScene from './scenes/MainScene';
import LoadingScene from './scenes/LoadingScene';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 800;

const Config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

export default Config;
