import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, X, ChevronUp, ChevronDown } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  title: string;
  onClose: () => void;
}

// Strip markdown syntax to get clean readable text
const stripMarkdown = (text: string): string => {
  return text
    .replace(/#{1,6}\s+/g, '') // headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^\s*[-*+]\s+/gm, '') // bullet points
    .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
    .replace(/^\s*>\s+/gm, '') // blockquotes
    .replace(/\[COMPONENT:[^\]]+\][\s\S]*?\}/g, '') // custom components
    .replace(/---/g, '') // dividers
    .replace(/\n{3,}/g, '\n\n') // excess newlines
    .trim();
};

// Split text into readable chunks (sentences)
const splitIntoChunks = (text: string): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > 200) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks.filter(c => c.length > 0);
};

const AudioPlayer = ({ text, title, onClose }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  const cleanText = stripMarkdown(text);

  useEffect(() => {
    chunksRef.current = splitIntoChunks(cleanText);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [cleanText]);

  const speakChunk = useCallback((index: number) => {
    if (index >= chunksRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      isPlayingRef.current = false;
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunksRef.current[index]);
    utterance.rate = speed;
    utterance.volume = isMuted ? 0 : 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (isPlayingRef.current) {
        const next = index + 1;
        setCurrentChunk(next);
        setProgress(Math.round((next / chunksRef.current.length) * 100));
        speakChunk(next);
      }
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [speed, isMuted]);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      isPlayingRef.current = true;
    } else {
      window.speechSynthesis.cancel();
      setIsPlaying(true);
      setIsPaused(false);
      isPlayingRef.current = true;
      speakChunk(currentChunk);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunk(0);
    setProgress(0);
    isPlayingRef.current = false;
  };

  const handleSkip = () => {
    window.speechSynthesis.cancel();
    const next = Math.min(currentChunk + 5, chunksRef.current.length - 1);
    setCurrentChunk(next);
    setProgress(Math.round((next / chunksRef.current.length) * 100));
    if (isPlaying) {
      setTimeout(() => speakChunk(next), 100);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setTimeout(() => speakChunk(currentChunk), 100);
    }
  };

  const handleClose = () => {
    window.speechSynthesis.cancel();
    isPlayingRef.current = false;
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 1 : 0;
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[100] transition-all duration-300 ${isMinimized ? 'translate-y-[calc(100%-48px)]' : 'translate-y-0'}`}>
      <div className="bg-black/95 border-t border-violet-500/30 backdrop-blur-xl shadow-2xl shadow-violet-950/50">
        {/* Drag handle / minimize bar */}
        <div
          className="flex items-center justify-between px-4 h-12 cursor-pointer border-b border-white/5"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-violet-400" />
            <span className="font-body text-xs text-white/60 truncate max-w-[200px] sm:max-w-xs">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            {isMinimized ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="text-white/40 hover:text-white/70 transition-colors p-1"
              aria-label="Close audio player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player controls */}
        <div className="px-4 py-4">
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mute */}
              <button
                onClick={toggleMute}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Stop */}
              <button
                onClick={handleStop}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label="Stop"
              >
                <Square className="w-4 h-4" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-all shadow-lg shadow-violet-900/40 active:scale-95"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white fill-white" />
                ) : (
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                )}
              </button>

              {/* Skip forward */}
              <button
                onClick={handleSkip}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label="Skip forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed + progress text */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSpeedChange}
                className="font-body text-xs text-white/50 hover:text-violet-400 transition-colors bg-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1.5 border border-white/10"
              >
                {speed}x
              </button>
              <span className="font-body text-xs text-white/30 tabular-nums">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
