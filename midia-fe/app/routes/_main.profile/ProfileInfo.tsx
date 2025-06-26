import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { Button } from '@heroui/react'

interface ProfileInfoProps {
  username: string
  fullName: string
  accountType?: string
  bio?: string
  website?: string
  postCount: number
  followerCount: number | string
  followingCount: number
  profileImageUrl: string
}

const ProfileInfo = ({
  username,
  fullName,
  accountType,
  bio,
  website,
  postCount,
  followerCount,
  followingCount,
  profileImageUrl
}: ProfileInfoProps) => {
  const stats = [
    { count: postCount, label: 'posts' },
    { count: followerCount, label: 'followers' },
    { count: followingCount, label: 'following' }
  ]
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start md:gap-20 gap-10 mb-10">
      {/* Profile Picture (Left Column) */}
      <div className="flex-shrink-0 w-28 h-28 md:w-40 md:h-40 flex items-center justify-center rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
        <img
          src={profileImageUrl}
          alt={`${username}'s profile`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Info and Stats (Right Column) */}
      <div className="flex flex-col flex-grow items-center md:items-start gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl md:text-2xl font-light">{username}</h2>
          <Button variant="flat" size="md">
            Edit profile
          </Button>
          <Button variant="flat" size="md">
            View Archive
          </Button>
          {/* Settings Icon */}
          <Cog6ToothIcon className="w-6 h-6 cursor-pointer" />
        </div>

        {/* Stats */}
        <div className="flex gap-6 md:gap-8 text-sm md:text-base">
          {stats.map(({ count, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="font-semibold">{count}</span>
              <span className="text-sm text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Full Name, Account Type, Bio, Website Link */}
        <div className="flex flex-col items-center md:items-start">
          <p className="font-semibold text-sm">{fullName}</p>
          {accountType && (
            <p className="text-xs text-gray-500">{accountType}</p>
          )}
          {bio && <p className="whitespace-pre-line text-sm mt-2">{bio}</p>}
          {website && (
            <a
              href={`http://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm mt-1"
            >
              {website}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
