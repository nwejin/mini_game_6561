import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/6561');
  return (
    <div className="w-full min-h-screen flex items-center justify-center py-4 px-4">
      <Link href="/6561">
        <button className="bg-blue-500 px-10 py-3 rounded-xl text-white text-xl font-bold">GAME START - 6561</button>
      </Link>

      <Link href="/enhance">
        <button className="bg-green-500 px-10 py-3 rounded-xl text-white text-xl font-bold">
          GAME START - 강화x강화
        </button>
      </Link>
    </div>
  );
}
