import { useState } from 'react'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

// Default values moved outside component
const DEFAULT_MENTIONS: string[] = []
const DEFAULT_IS_LIKED = false
const DEFAULT_CLASS_NAME = ''

interface CommentProps {
  username: string
  content: string
  mentions?: string[]
  timestamp?: string
  likes?: number
  isLiked?: boolean
  onLike?: () => void
  onUserClick?: (username: string) => void
  className?: string
}

const Comment = ({
  username,
  content,
  mentions = DEFAULT_MENTIONS,
  timestamp,
  isLiked = DEFAULT_IS_LIKED,
  onLike,
  onUserClick,
  className = DEFAULT_CLASS_NAME
}: CommentProps) => {
  const [liked, setLiked] = useState(isLiked)

  const handleLike = () => {
    setLiked(!liked)
    onLike?.()
  }

  const handleUserClick = () => {
    onUserClick?.(username)
  }

  const processedContent =
    mentions.length > 0
      ? content.split(' ').map((word) => {
          const isMention = mentions.some((mention) => word === `@${mention}`)
          return isMention ? (
            <span
              key={`${username}-mention-${word}`}
              className="text-[#00376B] font-semibold"
            >
              {word}
            </span>
          ) : (
            word
          )
        })
      : content

  return (
    <div className={`flex items-start justify-between gap-2 ${className}`}>
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={handleUserClick}
          className="hover:underline mr-1"
        >
          {username}
        </button>
        <span>{processedContent}</span>
        {timestamp && (
          <div className="mt-1 text-xs text-[#8e8e8e]">{timestamp}</div>
        )}
      </div>
      <button
        type="button"
        onClick={handleLike}
        className="flex-shrink-0 p-0.5 hover:opacity-70 transition-opacity"
      >
        {liked ? (
          <HeartSolid className="w-4 h-4 text-red-500" />
        ) : (
          <HeartOutline className="w-4 h-4 text-gray-600 dark:text-white" />
        )}
      </button>
    </div>
  )
}

export default Comment
