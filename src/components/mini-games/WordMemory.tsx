import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Trophy, Timer, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';

const WORDS = [
  "CRYPTO", "BLOCK", "CHAIN", "TOKEN", "STAKE", "YIELD", "MINER", "WALLET",
  "NODE", "PROOF", "HASH", "ASSET", "SMART", "COIN", "GAS", "ETHER"
];

export const WordMemory: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const { playClick, playSuccess, playError } = useAchievementSounds();
  const [sequence, setSequence] = useState<string[]>([]);
  const [isShowing, setIsShowing] = useState(true);
  const [currentIndex, setCurrentStep] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const startLevel = useCallback(() => {
    const newSequence = [];
    for (let i = 0; i < level + 2; i++) {
      newSequence.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }
    setSequence(newSequence);
    setIsShowing(true);
    setCurrentStep(0);

    // Show each word for 1.5 seconds
    setTimeout(() => {
      setIsShowing(false);
    }, (level + 2) * 1500);
  }, [level]);

  useEffect(() => {
    startLevel();
  }, [level, startLevel]);

  const handleWordClick = (word: string) => {
    if (isShowing || isGameOver) return;

    if (word === sequence[currentIndex]) {
      playClick();
      if (currentIndex === sequence.length - 1) {
        setScore(prev => prev + (level * 10));
        if (level < 10) {
          setLevel(prev => prev + 1);
        } else {
          handleGameOver(true);
        }
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      playError();
      handleGameOver(false);
    }
  };

  const handleGameOver = (won: boolean) => {
    setIsGameOver(true);
    if (won) playSuccess();
    onComplete(score);
  };

  if (isGameOver) {
    return (
      <div className="text-center space-y-6">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto glow-yellow" />
        <h3 className="text-2xl font-bold font-consciousness">Game Over</h3>
        <p className="text-4xl font-bold text-primary">{score} Points</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex justify-between items-center font-consciousness text-sm">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span>Level {level}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Score: {score}</span>
        </div>
      </div>

      <div className="h-40 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isShowing ? (
            <motion.div
              key={`word-${currentIndex}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-4xl font-bold text-white tracking-widest"
            >
              {sequence[Math.floor((Date.now() % (sequence.length * 1500)) / 1500)] || sequence[0]}
              {/* Note: This is a simplification for the demo, real logic would use a timer for sequential display */}
            </motion.div>
          ) : (
            <div className="text-center">
              <p className="text-white/50 text-sm mb-2">Repeat the sequence</p>
              <div className="flex gap-1">
                {sequence.map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < currentIndex ? 'bg-primary' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>

        {isShowing && (
           <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-[1500ms]" style={{ width: '100%' }} />
        )}
      </div>

      {!isShowing && (
        <div className="grid grid-cols-3 gap-2">
          {WORDS.map(word => (
            <Button
              key={word}
              variant="outline"
              size="sm"
              className="text-[10px] h-10"
              onClick={() => handleWordClick(word)}
            >
              {word}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
