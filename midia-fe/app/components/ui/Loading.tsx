import React from 'react';

const Loading: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`} aria-label="Loading">
    <span className="loading-dot bg-neutral-400 dark:bg-neutral-600" />
    <span className="loading-dot bg-neutral-400 dark:bg-neutral-600" />
    <span className="loading-dot bg-neutral-400 dark:bg-neutral-600" />
    <style>{`
      .loading-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin: 0 3px;
        animation: loading-bounce 1.4s infinite both;
      }
      .loading-dot:nth-child(1) { animation-delay: 0s; }
      .loading-dot:nth-child(2) { animation-delay: 0.2s; }
      .loading-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes loading-bounce {
        0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
        40% { transform: scale(1.2); opacity: 1; }
      }
    `}</style>
  </div>
);

export default Loading; 