import { useEffect, useRef, useState } from 'react';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
  iconClassName?: string;
}

const EMOJIS = [
  '😀', '😂', '😍', '🥰', '😎', '😭', '👍', '🔥', '🎉', '🥳', '😡', '😱', '🤔', '😇', '😅'
];

const EmojiPicker = ({ onEmojiSelect, className = '', iconClassName = '' }: EmojiPickerProps) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmoji]);

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      <span
        className={`pt-2 cursor-pointer ${iconClassName}`}
        onClick={() => setShowEmoji(!showEmoji)}
      >
        <FaceSmileIcon className="w-5 h-5" />
      </span>

      {showEmoji && (
        <div className="absolute right-0 bottom-full mb-2 z-50 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg p-2 flex flex-wrap gap-1 w-60">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="text-2xl p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded"
              onClick={() => handleEmojiClick(emoji)}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
