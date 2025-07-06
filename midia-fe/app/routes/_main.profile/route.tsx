import { useAuth } from '~/contexts/AuthContext'
import ProfilePage from './ProfilePage'
import ProfileInfo from './ProfileInfo'

export default function ProfileIndex() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProfileInfo
        username={user?.username || ''}
        fullName={user?.profile?.fullName || ''}
        bio={user?.profile?.bio}
        postCount={user?.stats?.totalPosts || 0}
        followerCount={user?.stats?.totalFollowers || 0}
        followingCount={user?.stats?.totalFollowings || 0}
        profileImageUrl={user?.profile?.avatarUrl || ''}
      />
      <ProfilePage />
    </div>
  )
}
