import { Button } from '@heroui/react'
import Avatar from '../ui/Avatar'
import useFollow from '~/hooks/useFollow'
import { useState } from 'react'
import { cn } from '~/lib/utils'

interface UserListItemProps {
  id: string
  avatar?: string
  username: string
  subtitle?: string
  isFollowing?: boolean
  className?: string
}

const UserListItem = ({
  id,
  avatar,
  username,
  subtitle,
  isFollowing = false,
  className
}: UserListItemProps) => {
  const [follow, setFollow] = useState(isFollowing)
  const { toggleFollow, isLoading } = useFollow()

  return (
    <div
      className={cn(
        `flex items-center justify-between w-full h-full p-2`,
        className
      )}
    >
      {/* User Info Section */}
      <Avatar
        id={id}
        avatar={avatar}
        username={username}
        subtitle={subtitle}
        hideFollow
      />

      <Button
        onPress={() => {
          toggleFollow({
            variables: { targetUserId: id },
            onCompleted: () => {
              setFollow(!follow)
            },
            onError: (err) => {
              console.error('Error toggling follow:', err)
            }
          })
        }}
        variant="bordered"
        size="sm"
        className={`px-5 py-2 rounded-lg border text-[12px] font-semibold h-8 ${
          follow ? 'text-[#616161]' : ''
        }`}
        disabled={isLoading}
      >
        {follow ? 'Following' : 'Follow'}
      </Button>
    </div>
  )
}

export default UserListItem
