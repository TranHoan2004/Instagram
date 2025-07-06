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
  suggestedUsers?: User[]
  onSeeAll?: () => void
  onUserAction?: (userId: string, action: 'follow' | 'unfollow') => void
  className?: string
}

const SuggestedUsersList = ({
  suggestedUsers,
  onSeeAll,
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

  return (
    <div className={`w-full p-5 flex flex-col gap-5 ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full h-[15px]">
          <span className="text-sm font-medium leading-3.5">
            Suggested for you
          </span>
          <button
            type="button"
            onClick={handleSeeAll}
            className="text-xs font-medium leading-4 hover:opacity-70 transition-opacity"
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
