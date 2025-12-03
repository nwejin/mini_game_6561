'use client';

import { useEffect, useRef, useState } from 'react';
import { saveScore } from '@/lib/firestore';

export default function Home() {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameContainerRef.current) {
      initializeGame();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const [score, setScore] = useState(0);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [playTime, setPlayTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<'win' | 'lose'>('lose');
  const [nickname, setNickname] = useState('');

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
          game.registry.set('onStartTimer', handleStartTimer);
          game.registry.set('onStopTimer', handleStopTimer);
          game.registry.set('onGameOver', handleGameOver);
        },
      },
    });

    gameInstanceRef.current = game;
  }

  const handleReset = () => {
    const mainScene = gameInstanceRef.current?.scene.getScene('MainScene');
    if (mainScene && 'resetGame' in mainScene) {
      (mainScene as { resetGame: () => void }).resetGame();
    }
  };

  const handleStartTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setPlayTime(0);
    timerRef.current = setInterval(() => {
      setPlayTime((prev) => prev + 1);
    }, 1000);
  };

  const handleStopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleGameOver = (reason: 'win' | 'lose') => {
    handleStopTimer();
    setGameOverReason(reason);
    setShowGameOverPopup(true);
  };

  const handleSaveScore = async () => {
    try {
      await saveScore(nickname, score, playTime);
      setShowGameOverPopup(false);
      alert('점수가 저장되었습니다!');
    } catch (error) {
      console.error('점수 저장 실패:', error);
      alert('점수 저장에 실패했습니다.');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-4 px-4 gap-4">
      <div className=" rounded-lg px-3 py-1 shadow-md ">
        <p className="text-lg font-bold text-gray-500">
          {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}
        </p>
      </div>

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

      <div className="max-w-[600px] w-full  flex items-center justify-center">
        <button className="bg-green-500 text-white rounded-lg px-6 py-3 shadow-md hover:bg-green-600 transition-colors font-bold">
          SCORE BOARD
        </button>
      </div>

      {showGameOverPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-3xl font-bold text-center mb-4">{gameOverReason === 'win' ? 'WIN!' : 'GAME OVER'}</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-bold text-gray-500">score</p>
                <p className="text-2xl font-bold text-gray-800">{score}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-bold text-gray-500">play time</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <input
                type="text"
                placeholder="enter yout nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                maxLength={10}
              />
              <button
                onClick={handleSaveScore}
                disabled={!nickname.trim()}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-300">
                SAVE SCORE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
