'use client';

import { useEffect, useRef, useState } from 'react';
import { saveScore, getTopScores, ScoreData } from '@/lib/firestore';
// import SaveScore from '@/components/saveScore';
// import ShowScore from '@/components/showScore';

import { ScoreComponents } from '@/components';
import { GameMode } from '@/games/configs/BoardConfigs';

export default function Home() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameMode, setGameMode] = useState<GameMode>('4x4');

  useEffect(() => {
    if (gameContainerRef.current) {
      initializeGame(gameMode);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
      }
    };
  }, []);

  const [score, setScore] = useState(0);
  const [addScore, setAddScore] = useState(0);
  const [showAddScore, setShowAddScore] = useState(false);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [playTime, setPlayTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<'win' | 'lose'>('lose');

  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [topScores, setTopScores] = useState<ScoreData[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);

  async function initializeGame(mode: GameMode) {
    const Phaser = await import('phaser');
    const Config = (await import('../games/Config')).default;

    const handleScoreUpdate = (newScore: number) => {
      console.log('점수 업데이트:', newScore);
      setScore((prev) => prev + newScore);
      setAddScore(newScore);
      setShowAddScore(true);

      setTimeout(() => {
        setShowAddScore(false);
        console.log('점수 표시 숨김');
      }, 1000);
    };

    const handleResetGame = () => {
      setScore(0);
    };

    const game = new Phaser.Game({
      ...Config,
      parent: gameContainerRef.current,
      callbacks: {
        preBoot: (game) => {
          game.registry.set('gameMode', mode);
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
    // NEW GAME 버튼은 항상 바로 리셋
    handleStopTimer();
    setPlayTime(0);
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

  const handleSaveScore = async (nickname: string) => {
    try {
      await saveScore(nickname, score, playTime, gameMode);
      setShowGameOverPopup(false);
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

  const handleGameModeChange = (mode: GameMode) => {
    // 게임 진행 중이면 변경 불가
    if (score > 0 || playTime > 0) {
      return;
    }

    // MainScene의 changeGameMode 메서드 호출
    const mainScene = gameInstanceRef.current?.scene.getScene('MainScene');
    if (mainScene && 'changeGameMode' in mainScene) {
      (mainScene as { changeGameMode: (mode: GameMode) => void }).changeGameMode(mode);
    }

    setGameMode(mode);
    setScore(0);
    setPlayTime(0);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-4 px-4">
      <div className="w-full max-w-[600px] flex flex-col gap-4">
        <div className="flex gap-4 w-full">
          <div className="bg-blue-50 rounded-lg px-6 py-3 shadow-md flex-1">
            <p className="text-sm text-gray-600 font-semibold">SCORE</p>
            <div className="flex gap-2 items-center">
              <p className="text-2xl font-bold text-gray-800">{score}</p>
              {showAddScore && (
                <p
                  className="text-xl font-bold text-blue-800"
                  style={{
                    animation: 'fadeInOut 1s ease-in-out',
                  }}>
                  +{addScore}
                </p>
              )}
            </div>
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

        <div className="flex gap-4 w-full">
          <button
            onClick={() => handleGameModeChange('3x3')}
            disabled={score > 0 || playTime > 0}
            className={`rounded-lg px-6 py-3 shadow-md flex-1 text-xl font-bold transition-all ${
              gameMode === '3x3' ? 'bg-blue-600 text-white ' : 'bg-blue-500 text-white opacity-50 cursor-not-allowed'
            } ${score > 0 || playTime > 0 ? 'pointer-events-none' : 'hover:opacity-75'}`}>
            3x3
          </button>
          <button
            onClick={() => handleGameModeChange('4x4')}
            disabled={score > 0 || playTime > 0}
            className={`rounded-lg px-6 py-3 shadow-md flex-1 text-xl font-bold transition-all ${
              gameMode === '4x4' ? 'bg-red-600 text-white ' : 'bg-red-500 text-white opacity-50 cursor-not-allowed'
            } ${score > 0 || playTime > 0 ? 'pointer-events-none' : 'hover:opacity-75'}`}>
            4x4
          </button>
        </div>

        <div className="w-full rounded-lg overflow-hidden">
          <div id="phaser-game" ref={gameContainerRef} className="rounded-lg overflow-hidden"></div>
        </div>

        <div className="w-full flex items-center justify-center">
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
    </div>
  );
}
