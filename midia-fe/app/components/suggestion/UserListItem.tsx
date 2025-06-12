import { Button } from '@heroui/react'
import Avatar from '../ui/Avatar'

interface UserListItemProps {
  avatar: string
  username: string
  subtitle: string
  isFollowing?: boolean
  onActionClick?: () => void
  className?: string
}

const UserListItem = ({
  avatar,
  username,
  subtitle,
  isFollowing = false,
  onActionClick,
  className = ''
}: UserListItemProps) => {
  return (
    <div
      className={`flex items-center justify-between w-full h-[38px] ${className}`}
    >
      {/* User Info Section */}
      <Avatar avatar={avatar} username={username} subtitle={subtitle} hideFollow/>

      <Button
        onPress={onActionClick}
        variant="bordered"
        size="sm"
        className={`px-5 py-2 rounded-lg border text-[12px] font-semibold h-8 ${
          isFollowing ? 'text-[#616161]' : ''
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
    </div>
  )
}

export default UserListItem
