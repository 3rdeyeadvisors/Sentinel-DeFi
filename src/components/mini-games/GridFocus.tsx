import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';
import { Target, Trophy, Timer } from 'lucide-react';
import { toast } from "sonner";
import { GameIntro } from './GameIntro';

export const GridFocus: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const { playClick, playSuccess, playError } = useAchievementSounds();
  const [gridSize, setGridSize] = useState(3);
  const [targetNumber, setTargetNumber] = useState(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const generateGrid = useCallback(() => {
    const total = gridSize * gridSize;
    const arr = Array.from({ length: total }, (_, i) => i + 1);
    // Shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setNumbers(arr);
    setTargetNumber(1);
  }, [gridSize]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0 && !isGameOver) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isGameOver]);

  const handleStart = () => {
    setIsStarted(true);
    generateGrid();
  };

  const handleNumberClick = (num: number) => {
    if (num === targetNumber) {
      playClick();
      setScore(prev => prev + 5);
      if (targetNumber === gridSize * gridSize) {
        // Level up
        if (gridSize < 6) {
          setGridSize(prev => prev + 1);
          setScore(prev => prev + 50); // Bonus for finishing a grid
          toast.success("Level Up!");
        } else {
          generateGrid(); // Just refresh if max size
        }
      } else {
        setTargetNumber(prev => prev + 1);
      }
    } else {
      playError();
      setScore(prev => Math.max(0, prev - 2));
    }
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    playSuccess();
    onComplete(score);
  };

  const resetGame = () => {
    setGridSize(3);
    setTargetNumber(1);
    setNumbers([]);
    setTimeLeft(30);
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
    generateGrid();
  };

  if (!isStarted) {
    return (
      <GameIntro
        title="Grid Focus"
        description="Enhance peripheral vision and visual search speed by locating numbers in sequence."
        icon={Target}
        instructions={[
          `Locate and click numbers in sequence from 1 to ${gridSize * gridSize}.`,
          "The grid will expand as you progress.",
          "Speed is rewarded with bonus points.",
          "Complete as many grids as possible before time runs out."
        ]}
        onStart={handleStart}
      />
    );
  }

  if (isGameOver) {
    return (
      <div className="text-center space-y-6">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto glow-yellow" />
        <h3 className="text-2xl font-bold font-consciousness">Time's Up!</h3>
        <p className="text-4xl font-bold text-primary">{score} Points</p>
        <Button onClick={resetGame}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex justify-between items-center font-consciousness text-sm">
        <div className="flex items-center gap-2 text-primary">
          <Timer className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
        <div className="text-white/80">
          Next: <span className="text-primary font-bold text-xl">{targetNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-yellow-500">
          <Trophy className="w-4 h-4" />
          <span>{score}</span>
        </div>
      </div>

      <div
        className="grid gap-2 bg-white/5 p-4 rounded-2xl border border-white/10"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1/1'
        }}
      >
        {numbers.map((num) => (
          <motion.button
            key={num}
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNumberClick(num)}
            className={`flex items-center justify-center rounded-xl font-bold text-lg transition-all ${
              num < targetNumber
                ? 'bg-primary/20 text-white/20 border-transparent cursor-default'
                : 'bg-white/10 text-white border border-white/10 hover:border-primary/50 hover:bg-primary/10'
            }`}
          >
            {num}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
