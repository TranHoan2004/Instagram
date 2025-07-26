import { Outlet, useParams } from 'react-router'
import ProfileInfo from '~/components/profile/ProfileInfo'
import ProfileTabs from '~/components/profile/ProfileTabs'
import useUser from '~/hooks/useUser'

const UserProfileLayout = () => {
  const { userId } = useParams()

  const { user } = useUser(userId!!)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-full">
      <ProfileInfo
        id={user?.id || ''}
        username={user?.username || ''}
        fullName={user?.profile?.fullName || ''}
        bio={user?.profile?.bio}
        postCount={user?.stats?.totalPosts || 0}
        followerCount={user?.stats?.totalFollowers || 0}
        followingCount={user?.stats?.totalFollowings || 0}
        profileImageUrl={user?.profile?.avatarUrl || ''}
      />

      <ProfileTabs />
      <Outlet />
    </div>
  )
}

export default UserProfileLayout
