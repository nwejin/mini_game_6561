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
  // 빠른 시간 순 정렬 (오름차순), 시간이 같으면 점수 높은 순 (내림차순)
  const q = query(scoresRef, orderBy('time', 'asc'), orderBy('score', 'desc'), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ScoreData);
}
