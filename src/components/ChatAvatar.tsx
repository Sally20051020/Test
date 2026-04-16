import { useEffect, useState } from 'react';

interface ChatAvatarProps {
  isThinking: boolean;
}

export function ChatAvatar({ isThinking }: ChatAvatarProps) {
  const [blink, setBlink] = useState(false);
  const [bounce, setBounce] = useState(false);

  // Blink every few seconds when idle
  useEffect(() => {
    if (isThinking) return;
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [isThinking]);

  // Bounce animation when thinking
  useEffect(() => {
    if (!isThinking) { setBounce(false); return; }
    const interval = setInterval(() => setBounce((b) => !b), 600);
    return () => clearInterval(interval);
  }, [isThinking]);

  const eyeHeight = blink ? 1 : 5;
  const eyeY = blink ? 30 : 28;

  return (
    <div className="w-20 h-20 shrink-0">
      <svg
        viewBox="0 0 80 80"
        className={`w-full h-full transition-transform duration-500 ${bounce ? '-translate-y-1' : 'translate-y-0'}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head / body */}
        <rect x="15" y="12" width="50" height="44" rx="14" className="fill-primary/20 stroke-primary" strokeWidth="2" />

        {/* Antenna */}
        <line x1="40" y1="12" x2="40" y2="4" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="3" r="3" className={`transition-colors duration-300 ${isThinking ? 'fill-warning animate-pulse' : 'fill-primary'}`} />

        {/* Eyes */}
        <rect x="26" y={eyeY} width="8" height={eyeHeight} rx={blink ? 0.5 : 2.5} className="fill-primary transition-all duration-150" />
        <rect x="46" y={eyeY} width="8" height={eyeHeight} rx={blink ? 0.5 : 2.5} className="fill-primary transition-all duration-150" />

        {/* Mouth */}
        {isThinking ? (
          // Thinking: animated dots
          <>
            <circle cx="31" cy="42" r="2" className="fill-primary animate-pulse" style={{ animationDelay: '0ms' }} />
            <circle cx="40" cy="42" r="2" className="fill-primary animate-pulse" style={{ animationDelay: '200ms' }} />
            <circle cx="49" cy="42" r="2" className="fill-primary animate-pulse" style={{ animationDelay: '400ms' }} />
          </>
        ) : (
          // Idle: smile
          <path d="M 30 40 Q 40 48 50 40" fill="none" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* Body / base */}
        <rect x="22" y="58" width="36" height="12" rx="6" className="fill-primary/15 stroke-primary/50" strokeWidth="1.5" />

        {/* Arms */}
        <rect
          x="8" y="30" width="8" height="20" rx="4"
          className={`fill-primary/15 stroke-primary/50 transition-transform duration-500 origin-top ${isThinking ? 'rotate-[-8deg]' : 'rotate-0'}`}
          strokeWidth="1.5"
        />
        <rect
          x="64" y="30" width="8" height="20" rx="4"
          className={`fill-primary/15 stroke-primary/50 transition-transform duration-500 origin-top ${isThinking ? 'rotate-[8deg]' : 'rotate-0'}`}
          strokeWidth="1.5"
        />

        {/* Screen glare */}
        <rect x="20" y="16" width="8" height="4" rx="2" className="fill-white/30" />
      </svg>
    </div>
  );
}
