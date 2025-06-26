import { HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid'
import React, { useRef } from 'react'

interface ProfileThumbnailProps {
  src: string
  alt: string
  likes?: number
  comments?: number
  onClick?: () => void
  className?: string
}

const ProfileThumbnail = ({ src, alt, likes = 0, comments = 0, onClick, className }: ProfileThumbnailProps) => {
  const imageRef = useRef<HTMLImageElement>(null);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick();
    }
  }

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      className={`relative w-full h-0 pb-[125%] overflow-hidden group cursor-pointer focus:outline-none rounded-sm ${className}`}
      aria-label={`Post by ${alt}. ${likes} likes, ${comments} comments`}
    >
      <div className="absolute inset-0">
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"
          aria-hidden="true"
        />
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center space-x-4"
          aria-hidden="true"
        >
          <div className="relative flex items-center text-white text-lg font-bold">
            <HeartIcon className="h-6 w-6 mr-1" aria-hidden="true" />
            <span>{likes}</span>
          </div>
          <div className="relative flex items-center text-white text-lg font-bold">
            <ChatBubbleOvalLeftIcon className="h-6 w-6 mr-1" aria-hidden="true" />
            <span>{comments}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileThumbnail
