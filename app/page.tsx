'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameContainerRef.current) {
      initializeGame();
    }
  }, []);

  const [score, setScore] = useState(0);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  async function initializeGame() {
    const Phaser = await import('phaser');
    const Config = (await import('../games/Config')).default;

    const handleScoreUpdate = (newScore: number) => {
      setScore((prev) => prev + newScore);
    };

    const handleResetGame = () => {
      setScore(0);
    };

    const game = new Phaser.Game({
      ...Config,
      parent: gameContainerRef.current,
      callbacks: {
        preBoot: (game) => {
          game.registry.set('onScoreUpdate', handleScoreUpdate);
          game.registry.set('onResetGame', handleResetGame);
        }
      }
    });

    gameInstanceRef.current = game;
  }

  const handleReset = () => {
    const mainScene = gameInstanceRef.current?.scene.getScene('MainScene');
    if (mainScene && 'resetGame' in mainScene) {
      (mainScene as { resetGame: () => void }).resetGame();
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-4 px-4 gap-4">
      <div className="flex gap-4 w-full max-w-[600px]">
        <div className="bg-blue-50 rounded-lg px-6 py-3 shadow-md flex-1">
          <p className="text-sm text-gray-600 font-semibold">SCORE</p>
          <p className="text-2xl font-bold text-gray-800">{score}</p>
        </div>
        <div className="bg-blue-50  rounded-lg px-6 py-3 shadow-md flex-1">
          <p className="text-sm text-gray-600 font-semibold">BEST</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>

        <button
          onClick={handleReset}
          className="bg-orange-500 text-white rounded-lg px-6 py-3 shadow-md hover:bg-orange-600 transition-colors font-bold">
          NEW GAME
        </button>
      </div>

      <div className="w-full rounded-lg overflow-hidden">
        <div id="phaser-game" ref={gameContainerRef} className="rounded-lg overflow-hidden"></div>
      </div>
    </div>
  );
}
