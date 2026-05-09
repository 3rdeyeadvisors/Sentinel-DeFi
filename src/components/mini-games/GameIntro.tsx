import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface GameIntroProps {
  title: string;
  description: string;
  instructions: string[];
  icon: LucideIcon;
  onStart: () => void;
}

export const GameIntro: React.FC<GameIntroProps> = ({
  title,
  description,
  instructions,
  icon: Icon,
  onStart,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 max-w-sm mx-auto p-4"
    >
      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-3xl font-bold font-consciousness tracking-tight">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{description}</p>

      <div className="bg-white/5 rounded-xl p-4 text-left border border-white/10">
        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">How to play:</h4>
        <ul className="space-y-2">
          {instructions.map((step, idx) => (
            <li key={idx} className="text-sm text-white/80 flex gap-3">
              <span className="text-primary font-bold">{idx + 1}.</span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <Button onClick={onStart} size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
        Start Training
      </Button>
    </motion.div>
  );
};
