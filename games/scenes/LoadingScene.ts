import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../Config';

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // 로딩 텍스트
    const loadingText = this.add.text(centerX - 30, centerY + 30, 'Loading...', {
      fontSize: '18px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    // 로딩 바 배경 (회색)
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x444444, 1);
    progressBox.fillRect(centerX - 160, centerY - 10, 320, 20);

    // 로딩 바 (파란색)
    const progressBar = this.add.graphics();

    // 퍼센트 텍스트
    const percentText = this.add.text(centerX + 50, centerY + 30, '0%', {
      fontSize: '18px',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5, 0.5);

    // preload에서 UI 요소들을 data에 저장
    this.data.set('progressBar', progressBar);
    this.data.set('percentText', percentText);
    this.data.set('centerX', centerX);
    this.data.set('centerY', centerY);

    // 실제 이미지 로딩
    this.load.image('tile_blue', '/tile_blue.png');
    this.load.image('tile_red', '/tile_red.png');
    this.load.image('tile_orange', '/tile_orange.png');

    const tileValues = [3, 9, 27, 81, 243, 729, 2187, 6561, 19683];

    tileValues.forEach((value) => {
      this.load.image(`tile_${value}`, `tile_${value}.png`);
    });
  }

  create() {
    const progressBar = this.data.get('progressBar') as Phaser.GameObjects.Graphics;
    const percentText = this.data.get('percentText') as Phaser.GameObjects.Text;
    const centerX = this.data.get('centerX') as number;
    const centerY = this.data.get('centerY') as number;

    let progress = 0;

    // 1초마다 33%, 33%, 34% 증가 (총 100%)
    const increments = [33, 33, 34];
    let step = 0;

    const timer = this.time.addEvent({
      delay: 1000, // 1초마다
      callback: () => {
        progress += increments[step];

        // 프로그레스 바 업데이트
        progressBar.clear();
        progressBar.fillStyle(0x064dff, 1);
        progressBar.fillRect(centerX - 160, centerY - 10, 320 * (progress / 100), 20);

        // 퍼센트 텍스트 업데이트
        percentText.setText(progress + '%');

        step++;

        // 100% 도달 시 타이머 정지
        if (progress >= 100) {
          timer.remove();
        }
      },
      repeat: 2, // 3번 실행 (0, 1, 2)
    });

    // 3.5초 후 MainScene으로 전환 (100%를 0.5초 보여주고 전환)
    this.time.delayedCall(3500, () => {
      this.scene.start('MainScene');
    });
  }
}
