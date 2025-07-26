import { useState, useEffect } from 'react'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { Avatar as HAvatar } from '@heroui/react'
import { Link } from 'react-router'
import useFollow from '~/hooks/useFollow'
import { useAuth } from '~/contexts/AuthContext'
import { cn } from '~/lib/utils'

interface AvatarProps {
  id: string
  avatar?: string
  username: string
  subtitle?: string
  isVerified?: boolean
  isFollowing?: boolean
  timestamp?: string
  hideFollow?: boolean
  isBordered?: boolean
}

const Avatar = ({
  id,
  avatar,
  username,
  subtitle,
  isVerified,
  timestamp,
  isFollowing = false,
  hideFollow,
  isBordered = false
}: AvatarProps) => {
  const { user } = useAuth()

  const shouldHideFollow = hideFollow || user?.id === id

  const [follow, setFollow] = useState(isFollowing)
  const { toggleFollow, isLoading } = useFollow()

  useEffect(() => {
    setFollow(isFollowing)
  }, [isFollowing])

  const handleFollowClick = () => {
    if (isLoading) return
    toggleFollow({
      variables: { targetUserId: id },
      onCompleted: () => setFollow(prev => !prev),
    })
  }

  return (
    <div className="flex gap-3 items-center">
      <div className="relative group cursor-pointer">
        <HAvatar
          isBordered={isBordered}
          radius="full"
          size="md"
          src={avatar}
          className={cn(isBordered && 'hover:ring-2 group-hover:ring-blue-500')}
        />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <Link className="text-sm font-bold cursor-pointer" to={`/users/${id}`}> 
            {username}
          </Link>
          {isVerified && (
            <CheckBadgeIcon className="w-3.5 h-3.5 text-[#0095F6]" />
          )}
          {timestamp && (
            <h5 className="text-xs text-gray-500 dark:text-gray-400">
              • {timestamp}
            </h5>
          )}

          {!shouldHideFollow && (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
              {follow ? (
                <h5
                  className="text-xs italic text-gray-400 dark:text-gray-500 cursor-default"
                >
                  Following
                </h5>
              ) : (
                <h5
                  className="text-xs font-bold text-blue-500 dark:text-blue-400 cursor-pointer"
                  onClick={handleFollowClick}
                >
                  Follow
                </h5>
              )}
            </>
          )}
        </div>
        {subtitle && (
          <h5 className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </h5>
        )}
      </div>
    </div>
  )
}

export default Avatar
 