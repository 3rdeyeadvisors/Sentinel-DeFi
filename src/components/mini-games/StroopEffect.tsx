import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, Trophy, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';
import { GameIntro } from './GameIntro';

const COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"];
const COLOR_NAMES = ["RED", "BLUE", "GREEN", "YELLOW"];

export const StroopEffect: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const { playClick, playSuccess, playError } = useAchievementSounds();
  const [currentText, setCurrentText] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleGameOver();
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  const nextChallenge = () => {
    const textIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    const colorIdx = Math.floor(Math.random() * COLORS.length);
    setCurrentText(COLOR_NAMES[textIdx]);
    setCurrentColor(COLORS[colorIdx]);
  };

  const handleStart = () => {
    setIsStarted(true);
    nextChallenge();
  };

  const handleAnswer = (colorName: string) => {
    if (!isStarted || isGameOver) return;

    const actualColorName = COLOR_NAMES[COLORS.indexOf(currentColor)];
    if (colorName === actualColorName) {
      playClick();
      setScore(prev => prev + 10);
      nextChallenge();
    } else {
      playError();
      setScore(prev => Math.max(0, prev - 5));
      nextChallenge();
    }
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    playSuccess();
    onComplete(score);
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    setIsStarted(true);
    nextChallenge();
  };

  if (!isStarted) {
    return (
      <GameIntro
        title="Stroop Test"
        description="Overcome cognitive interference by identifying the color of the text rather than reading the word itself."
        icon={Zap}
        instructions={[
          "Look at the word displayed in the center.",
          "Identify the actual color of the font.",
          "Ignore what the word says.",
          "Click the button corresponding to the font color as fast as possible."
        ]}
        onStart={handleStart}
      />
    );
  }

  if (isGameOver) {
    return (
      <div className="text-center space-y-6">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto glow-yellow" />
        <h3 className="text-2xl font-bold font-consciousness">Test Complete</h3>
        <p className="text-4xl font-bold text-primary">{score} Points</p>
        <Button onClick={resetGame}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex justify-between items-center font-consciousness text-sm">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Time: {timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span>Score: {score}</span>
        </div>
      </div>

      <Card className="h-48 flex items-center justify-center bg-white/5 border-white/10 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentText + currentColor}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-6xl font-black tracking-tighter"
            style={{ color: currentColor }}
          >
            {currentText}
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {COLOR_NAMES.map(name => (
          <Button
            key={name}
            variant="outline"
            className="h-16 text-lg font-bold border-white/10 hover:bg-white/5"
            onClick={() => handleAnswer(name)}
          >
            {name}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2 justify-center text-white/30 text-xs italic">
        <AlertCircle className="w-3 h-3" />
        Ignore the word, pick the color!
      </div>
    </div>
  );
};
