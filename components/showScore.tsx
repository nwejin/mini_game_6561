'use client';

import type { ScoreData } from '../lib/firestore';

interface ShowScoreProps {
  isLoadingScores: boolean;
  closeScoreBoard: () => void;
  topScores: ScoreData[];
}

export default function ShowScore({ isLoadingScores, closeScoreBoard, topScores }: ShowScoreProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">SCORE BOARD</h2>
          <button onClick={closeScoreBoard} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
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
  );
}
