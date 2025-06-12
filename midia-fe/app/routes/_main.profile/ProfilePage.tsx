import {
  PhotoIcon,
  FilmIcon,
  TagIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import {
  PhotoIcon as PhotoIconSolid,
  FilmIcon as FilmIconSolid,
  TagIcon as TagIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid'
import ProfileInfo from './ProfileInfo'
import { NavLink, Outlet, useLocation } from 'react-router'
import ProfileGrid from './ProfileGrid'

const mockProfileData = {
  username: 'diddy',
  fullName: 'Diddy',
  accountType: 'Influencer',
  bio: 'Your favourite Influencer clips 🐾 in your language 🌍',
  website: 'https://www.instagram.com/diddy/',
  postCount: 11,
  followerCount: 41,
  followingCount: 17,
  profileImageUrl:
    'https://th.bing.com/th/id/OIP.SkG-XTbIinPH_GO-l4vYEQHaLI?r=0&rs=1&pid=ImgDetMain',
  posts: Array.from({ length: 18 }).map((_, index) => ({
    id: `post-${index}`,
    imageUrl:
      'https://th.bing.com/th/id/OIP.8rT1-sF2Jz5lsDSaGr12VQHaFI?r=0&rs=1&pid=ImgDetMain',
    altText: `Post ${index + 1}`
  }))
}

type TabType = 'posts' | 'saved' | 'reels' | 'tagged'

const ProfilePage = () => {
  const {
    username,
    fullName,
    accountType,
    bio,
    website,
    postCount,
    followerCount,
    followingCount,
    profileImageUrl,
    posts
  } = mockProfileData

  const location = useLocation()

  const tabs: {
    type: TabType
    label: string
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    activeIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    to: string
  }[] = [
    {
      type: 'posts',
      label: 'POSTS',
      icon: PhotoIcon,
      activeIcon: PhotoIconSolid,
      to: ''
    },
    {
      type: 'saved',
      label: 'SAVED',
      icon: BookmarkIcon,
      activeIcon: BookmarkIconSolid,
      to: 'saved'
    },
    {
      type: 'reels',
      label: 'REELS',
      icon: FilmIcon,
      activeIcon: FilmIconSolid,
      to: 'reels'
    },
    {
      type: 'tagged',
      label: 'TAGGED',
      icon: TagIcon,
      activeIcon: TagIconSolid,
      to: 'tagged'
    }
  ]

  const getActiveTab = (): TabType => {
    const subpath = location.pathname.replace(/\/profile\/?/, '')
    if (!subpath || subpath === '/') return 'posts'

    const firstSegment = subpath.split('/')[0]
    if (firstSegment === 'saved') return 'saved'
    if (firstSegment === 'reels') return 'reels'
    if (firstSegment === 'tagged') return 'tagged'

    return 'posts'
  }

  const activeTab = getActiveTab()

  return (
    <div className="max-w-4xl mx-auto px-4">
      <ProfileInfo
        username={username}
        fullName={fullName}
        accountType={accountType}
        bio={bio}
        website={website}
        postCount={postCount}
        followerCount={followerCount}
        followingCount={followingCount}
        profileImageUrl={profileImageUrl}
      />

      <div className="mt-8 border-t border-gray-300 dark:border-gray-700">
        <div className="flex justify-center gap-16">
          {tabs.map((tab) => {
            const Icon = activeTab === tab.type ? tab.activeIcon : tab.icon

            return (
              <NavLink
                key={tab.type}
                to={tab.to}
                end={tab.type === 'posts'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 border-t-2 
                   transition-all duration-200 ease-in-out
                   ${
                     isActive
                       ? 'border-black text-black dark:border-white dark:text-white'
                       : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-100'
                   }`
                }
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-semibold">{tab.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'posts' ? <ProfileGrid posts={posts} /> : <Outlet />}
      </div>
    </div>
  )
}

export default ProfilePage
