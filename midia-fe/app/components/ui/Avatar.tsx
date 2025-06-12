import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { Avatar as HAvatar } from '@heroui/react'

interface AvatarProps {
  avatar: string
  username: string
  subtitle?: string
  isVerified?: boolean
  isFollowing?: boolean
  onActionClick?: () => void
  timestamp?: string
  hideFollow?: boolean
}

const Avatar = ({
  avatar,
  username,
  subtitle,
  isVerified,
  timestamp,
  isFollowing,
  onActionClick,
  hideFollow
}: AvatarProps) => {
  const onFollowClick = () => {
    onActionClick?.()
  }

  return (
    <div className="flex gap-3 items-center">
      <div className="relative group cursor-pointer">
        <HAvatar
          isBordered
          radius="full"
          size="md"
          src={avatar}
          className="hover:ring-2 group-hover:ring-blue-500"
        />
      </div>
      <div>
        <div className="flex items-center gap-1">
          <h4 className="text-sm font-bold cursor-pointer">
            {username}
          </h4>
          {isVerified && (
            <CheckBadgeIcon className="w-3.5 h-3.5 text-[#0095F6]" />
          )}
          {timestamp && (
            <h5 className="text-xs text-gray-500 dark:text-gray-400">
              • {timestamp}
            </h5>
          )}
          {!hideFollow && !isFollowing && (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                •
              </span>
              <h5
                className="text-xs font-bold text-blue-500 dark:text-blue-400 cursor-pointer"
                onClick={onFollowClick}
              >
                Follow
              </h5>
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
