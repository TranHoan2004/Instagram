import UserListItem from './UserListItem'
import { useNavigate } from 'react-router'
import useSuggestUsers from '~/hooks/useSuggestion'

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
  className = ''
}: SuggestedUsersListProps) => {
  const navigate = useNavigate()
  const { edges } = useSuggestUsers({
    first: 5,
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache'
  })
  const users = edges.map((edge) => edge.node)

  const handleSeeAll = () => {
    navigate('/explore/people')
  }

  return (
    <div className={`w-full p-5 flex flex-col gap-5 ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
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

        <div className="flex flex-col gap-4">
          {users.map((user) => (
            <UserListItem
              className="p-0"
              key={user.id}
              id={user.id}
              avatar={user?.profile?.avatarUrl}
              username={user.username}
              subtitle={user.profile?.fullName}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuggestedUsersList
