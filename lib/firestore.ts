import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export interface ScoreData {
  nickname: string;
  score: number;
  time: number;
  mode: string;
  createdAt: Timestamp;
}

export async function saveScore(nickname: string, score: number, time: number, mode: string) {
  const scoresRef = collection(db, 'scores');
  await addDoc(scoresRef, {
    nickname,
    score,
    time,
    mode,
    createdAt: Timestamp.now(),
  });
}

export async function getTopScores(limitCount: number = 10): Promise<ScoreData[]> {
  const scoresRef = collection(db, 'scores');
  const q = query(scoresRef, orderBy('score', 'desc'), orderBy('createdAt', 'asc'), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ScoreData);
}
