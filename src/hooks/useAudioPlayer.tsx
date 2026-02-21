import { useState } from 'react';

export const useAudioPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [audioText, setAudioText] = useState('');
  const [audioTitle, setAudioTitle] = useState('');

  const openAudio = (text: string, title: string) => {
    setAudioText(text);
    setAudioTitle(title);
    setIsOpen(true);
  };

  const closeAudio = () => setIsOpen(false);

  return { isOpen, audioText, audioTitle, openAudio, closeAudio };
};
