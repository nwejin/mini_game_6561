'use client';

import { useEffect, useRef, useState } from 'react';
import { saveScore, getTopScores, ScoreData } from '@/lib/firestore';

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
                placeholder="enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                maxLength={10}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveScore}
                  disabled={!nickname.trim()}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-300">
                  SAVE SCORE
                </button>
                <button
                  onClick={handleResetWithoutSaving}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600">
                  NEW GAME
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScoreBoard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">SCORE BOARD</h2>
              <button onClick={handleCloseScoreBoard} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                ✕
              </button>
            </div>

            {isLoadingScores ? (
              <div className="text-center py-8">
                <p className="text-gray-500">로딩 중...</p>
              </div>
            ) : topScores.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">아직 저장된 점수가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topScores.map((scoreData, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      index === 0
                        ? 'bg-yellow-100 border-2 border-yellow-400'
                        : index === 1
                        ? 'bg-gray-100 border-2 border-gray-400'
                        : index === 2
                        ? 'bg-orange-100 border-2 border-orange-400'
                        : 'bg-blue-50'
                    }`}>
                    <div className="text-2xl font-bold w-8 text-center">{index + 1}</div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{scoreData.nickname}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-bold">SCORE</p>
                      <p className="font-bold text-xl">{scoreData.score}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-bold">TIME</p>
                      <p className="font-bold text-lg">
                        {Math.floor(scoreData.time / 60)}:{(scoreData.time % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
