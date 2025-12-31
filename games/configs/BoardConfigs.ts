export type GameMode = '3x3' | '4x4';

export interface GameModeConfig {
  gridSize: number;
  tileSize: number;
  boardWidth: number;
  boardHeight: number;
}

export const GAME_MODE_CONFIGS: Record<GameMode, GameModeConfig> = {
  '3x3': {
    gridSize: 3,
    tileSize: 186, // 560 / 3 ≈ 186
    boardWidth: 560,
    boardHeight: 560,
  },
  '4x4': {
    gridSize: 4,
    tileSize: 140,
    boardWidth: 560,
    boardHeight: 560,
  },
};
