import { Avatar } from "@heroui/react"

interface UserInfoProps {
  avatar: string
  username: string
  isVerified?: boolean
  timestamp?: string
  size?: 'sm' | 'md' | 'lg'
  showBorder?: boolean
  onClick?: () => void
  className?: string
}

const UserInfo = ({
  avatar,
  username,
  isVerified = false,
  timestamp,
  size = 'md',
  showBorder = true,
  onClick,
  className = ''
}: UserInfoProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          avatar: 'w-6 h-6',
          text: 'text-sm',
          gap: 'gap-2'
        }
      case 'md':
        return {
          avatar: 'w-8 h-8',
          text: 'text-sm',
          gap: 'gap-2.5'
        }
      case 'lg':
        return {
          avatar: 'w-10 h-10',
          text: 'text-base',
          gap: 'gap-3'
        }
      default:
        return {
          avatar: 'w-8 h-8',
          text: 'text-sm',
          gap: 'gap-2.5'
        }
    }
  }

  const sizeClasses = getSizeClasses()
  const borderClass = showBorder ? 'border border-black' : ''
  const interactiveClass = onClick
    ? 'cursor-pointer hover:opacity-80 transition-opacity'
    : ''

  const content = (
    <div
      className={`flex items-center ${sizeClasses.gap} ${interactiveClass} ${className}`}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`${sizeClasses.avatar} rounded-full bg-gray-100 ${borderClass} overflow-hidden`}
        >
          <Avatar
            src={avatar}
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="flex items-center gap-1 min-w-0">
        <span
          className={`${sizeClasses.text} font-semibold text-[#262626] truncate`}
        >
          {username}
        </span>
        {isVerified && (
          <img
            src="https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/5126c50d-4f49-43dd-bff9-c7949c21093f"
            alt="Verified"
            className="w-3 h-3 flex-shrink-0"
          />
        )}
        {timestamp && (
          <span className={`${sizeClasses.text} text-[#8e8e8e] flex-shrink-0`}>
            • {timestamp}
          </span>
        )}
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="text-left">
        {content}
      </button>
    )
  }

  return content
}

export default UserInfo
