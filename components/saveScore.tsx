'use client';

import { useState } from 'react';

interface SaveScoreProps {
  gameOverReason: 'win' | 'lose';
  score: number;
  playTime: number;
  onSaveScore: (nickname: string) => Promise<void>;
  onResetWithoutSaving: () => void;
}

export default function SaveScore({
  gameOverReason,
  score,
  playTime,
  onSaveScore,
  onResetWithoutSaving,
}: SaveScoreProps) {
  const [nickname, setNickname] = useState('');

  const handleSave = async () => {
    await onSaveScore(nickname);
    setNickname('');
  };

  return (
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
              onClick={handleSave}
              disabled={!nickname.trim()}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-300">
              SAVE SCORE
            </button>
            <button
              onClick={onResetWithoutSaving}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600">
              NEW GAME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
