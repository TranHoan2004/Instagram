import { useState } from 'react'
import UserListItem from './UserListItem'

interface User {
  id: string
  avatar: string
  username: string
  subtitle: string
  isFollowing?: boolean
}

interface SuggestedUsersListProps {
  currentUser?: {
    avatar: string
    username: string
    displayName: string
  }
  suggestedUsers?: User[]
  onSeeAll?: () => void
  onSwitch?: () => void
  onUserAction?: (userId: string, action: 'follow' | 'unfollow') => void
  className?: string
}

const SuggestedUsersList = ({
  currentUser,
  suggestedUsers,
  onSeeAll,
  onSwitch,
  onUserAction,
  className = ''
}: SuggestedUsersListProps) => {
  const [users, setUsers] = useState<User[]>(
    suggestedUsers || [
      {
        id: '1',
        avatar:
          'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/953258d4-da1e-49c9-8b8c-cd84e0c8cdc1',
        username: 'mkbhd',
        subtitle: 'Follows you',
        isFollowing: true
      },
      {
        id: '2',
        avatar:
          'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/9470149c-de58-4b20-bf9e-5746770409e9',
        username: 'marh9',
        subtitle: 'Follows you',
        isFollowing: false
      },
      {
        id: '3',
        avatar:
          'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e4432e0c-5d7b-4107-937c-6f6dc52e1817',
        username: 'madebyryan',
        subtitle: 'Suggested for you',
        isFollowing: false
      },
      {
        id: '4',
        avatar:
          'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/b8882239-170f-4cfd-beb7-b42c22c5505b',
        username: 'saymekr',
        subtitle: 'Suggested for you',
        isFollowing: false
      },
      {
        id: '5',
        avatar:
          'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/47e0374b-4108-4b11-be37-b7b813e3ae71',
        username: 'jhsmith',
        subtitle: 'Suggested for you',
        isFollowing: false
      }
    ]
  )

  const defaultCurrentUser = currentUser || {
    avatar:
      'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/2e54f712-3fc7-4d59-add8-2352b20223b0',
    username: 'rtralrayhan',
    displayName: 'Shekh Al Raihan'
  }

  const handleUserAction = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      )
    )

    const user = users.find((u) => u.id === userId)
    if (user) {
      onUserAction?.(userId, user.isFollowing ? 'unfollow' : 'follow')
    }
  }

  const handleSeeAll = () => {
    console.log('See all suggestions')
    onSeeAll?.()
  }

  const handleSwitch = () => {
    console.log('Switch account')
    onSwitch?.()
  }

  return (
    <div className={`w-full p-5 flex flex-col gap-[23px] ${className}`}>
      <div className="flex items-center justify-between w-full h-[38px]">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-full overflow-hidden flex-shrink-0">
            <img
              src={defaultCurrentUser.avatar}
              alt={defaultCurrentUser.username}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-medium leading-[17px]">
              {defaultCurrentUser.username}
            </span>
            <span className="text-[14px] font-normal leading-[15px] opacity-60">
              {defaultCurrentUser.displayName}
            </span>
          </div>
        </div>

        <span
          onClick={handleSwitch}
          className="text-[12px] font-semibold leading-[13px] hover:opacity-80 transition-opacity cursor-pointer"
        >
          Switch
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full h-[15px]">
          <span className="text-[14px] font-medium leading-[15px]">
            Suggested for you
          </span>
          <button
            type="button"
            onClick={handleSeeAll}
            className="text-[12px] font-medium  leading-[13px] hover:opacity-70 transition-opacity"
          >
            See All
          </button>
        </div>

        <div className="flex flex-col gap-[15px]">
          {users.map((user) => (
            <UserListItem
              key={user.id}
              avatar={user.avatar}
              username={user.username}
              subtitle={user.subtitle}
              isFollowing={user.isFollowing}
              onActionClick={() => handleUserAction(user.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuggestedUsersList
