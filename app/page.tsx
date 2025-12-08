'use client';

import { useEffect, useRef, useState } from 'react';
import { saveScore, getTopScores, ScoreData } from '@/lib/firestore';
// import SaveScore from '@/components/saveScore';
// import ShowScore from '@/components/showScore';

import { ScoreComponents } from '@/components';

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

  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [topScores, setTopScores] = useState<ScoreData[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);

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
    if (score > 0) {
      handleStopTimer();
      setGameOverReason('win');
      setShowGameOverPopup(true);
    } else {
      // 스코어가 0이면 바로 리셋
      const mainScene = gameInstanceRef.current?.scene.getScene('MainScene');
      if (mainScene && 'resetGame' in mainScene) {
        (mainScene as { resetGame: () => void }).resetGame();
      }
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
      setNickname('');
      setPlayTime(0);
      alert('점수가 저장되었습니다!');
      const mainScene = gameInstanceRef.current?.scene.getScene('MainScene');
      if (mainScene && 'resetGame' in mainScene) {
        (mainScene as { resetGame: () => void }).resetGame();
      }
    } catch (error) {
      console.error('점수 저장 실패:', error);
      alert('점수 저장에 실패했습니다.');
    }
  };

  const handleResetWithoutSaving = () => {
    setShowGameOverPopup(false);
    setNickname('');
    setPlayTime(0);
    const mainScene = gameInstanceRef.current?.scene.getScene('MainScene');
    if (mainScene && 'resetGame' in mainScene) {
      (mainScene as { resetGame: () => void }).resetGame();
    }
  };

  const handleOpenScoreBoard = async () => {
    setShowScoreBoard(true);
    setIsLoadingScores(true);
    try {
      const scores = await getTopScores(10);
      setTopScores(scores);
    } catch (error) {
      console.error('점수 로드 실패:', error);
      alert('점수를 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingScores(false);
    }
  };

  const handleCloseScoreBoard = () => {
    setShowScoreBoard(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-4 px-4 gap-4">
      <div className="flex justify-end w-full max-w-[600px] gap-2"></div>

      <div className="flex gap-4 w-full max-w-[600px]">
        <div className="bg-blue-50 rounded-lg px-6 py-3 shadow-md flex-1">
          <p className="text-sm text-gray-600 font-semibold">SCORE</p>
          <p className="text-2xl font-bold text-gray-800">{score}</p>
        </div>
        <div className="bg-blue-50  rounded-lg px-6 py-3 shadow-md flex-1">
          <p className="text-sm text-gray-600 font-semibold">TIME</p>
          <p className="text-2xl font-bold text-gray-800">
            {Math.floor(playTime / 60)}:{(playTime % 60).toString().padStart(2, '0')}
          </p>
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
        <button
          onClick={handleOpenScoreBoard}
          className="bg-green-500 text-white rounded-lg px-6 py-3 shadow-md hover:bg-green-600 transition-colors font-bold">
          SCORE BOARD
        </button>
      </div>

      {showGameOverPopup && (
        <ScoreComponents.SaveScore
          gameOverReason={gameOverReason}
          score={score}
          playTime={playTime}
          onSaveScore={handleSaveScore}
          onResetWithoutSaving={handleResetWithoutSaving}
        />
      )}

      {showScoreBoard && (
        <ScoreComponents.ShowScore
          isLoadingScores={isLoadingScores}
          closeScoreBoard={handleCloseScoreBoard}
          topScores={topScores}
        />
      )}
    </div>
  );
}
