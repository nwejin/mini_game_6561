'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import Config from '../games/Config';

export default function Home() {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameContainerRef.current) {
      new Phaser.Game({
        ...Config,
        parent: gameContainerRef.current,
      });
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div id="phaser-game" ref={gameContainerRef} className="h-full w-full"></div>
    </div>
  );
}
