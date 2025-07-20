import { BookmarkIcon, PhotoIcon, TagIcon } from '@heroicons/react/24/outline'
import {
  BookmarkIcon as BookmarkIconSolid,
  PhotoIcon as PhotoIconSolid,
  TagIcon as TagIconSolid
} from '@heroicons/react/24/solid'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import type { Post } from '~/lib/types'
import PostDetailModal from '../../components/post/PostDetailModal'
import ProfileGrid from './ProfileGrid'

const mockProfileData = {
  username: 'username',
  fullName: 'Username',
  accountType: 'Influencer',
  bio: 'Your favourite Influencer clips 🐾 in your language 🌍',
  website: 'https://www.midia.com/',
  postCount: 11,
  followerCount: 41,
  followingCount: 17,
  profileImageUrl: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
    'https://images.unsplash.com/photo-1749581434794-d5de133303d9?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1742268582641-7dbe0ea10c82?q=80&w=1074&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1743448748313-80eb7f9eb2b7?q=80&w=1206&auto=format&fit=crop'
  ],
  posts: Array.from({ length: 6 }).map((_, index) => ({
    user: {
      avatar:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
      username: 'user1',
      isVerified: false
    },
    id: `post-${index}`,
    timestamp: new Date().toISOString(),
    image: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800'
    ],
    likes: [27, 14, 8, 32, 5, 19][index],
    caption: `Post ${index + 1}`,
    comments: [
      {
        id: `c${index}-1`,
        username: 'userA',
        content: 'Awesome pic! 😍',
        isLiked: true
      },
      {
        id: `c${index}-2`,
        username: 'userB',
        content: 'Nice! 👍',
        isLiked: false
      },
      {
        id: `c${index}-3`,
        username: 'userC',
        content: 'Love this view! 🌄',
        isLiked: false
      },
      {
        id: `c${index}-4`,
        username: 'userD',
        content: 'So beautiful! ❤️',
        isLiked: true
      },
      {
        id: `c${index}-5`,
        username: 'userE',
        content: '🔥🔥🔥',
        isLiked: false
      }
    ]
  })) as Post[]
}

type TabType = 'posts' | 'saved' | 'tagged'

const ProfilePage = () => {
  const {
    //username,
    //fullName,
    //accountType,
    //bio,
    //website,
    //postCount,
    //followerCount,
    //followingCount,
    //profileImageUrl,
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
    if (firstSegment === 'tagged') return 'tagged'

    return 'posts'
  }

  const activeTab = getActiveTab()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPostIndex, setSelectedPostIndex] = useState(0)

  const handlePostClick = (post: Post, index: number) => {
    setSelectedPostIndex(index)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mt-8 border-t border-gray-300 dark:border-gray-700">
        <div className="flex justify-center gap-8">
          {tabs.map((tab) => {
            const Icon = activeTab === tab.type ? tab.activeIcon : tab.icon

            return (
              <NavLink
                key={tab.type}
                to={tab.to}
                end={tab.type === 'posts'}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center gap-1.5 px-3 py-2.5 border-t-2 text-xs
                   transition-all duration-200 ease-in-out
                   ${
                     isActive
                       ? 'border-black text-black dark:border-white dark:text-white'
                       : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-100'
                   }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'posts' ? (
          <ProfileGrid posts={posts} onPostClick={handlePostClick} />
        ) : (
          <Outlet />
        )}
      </div>

      {isModalOpen && posts[selectedPostIndex] && (
        <PostDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          post={posts[selectedPostIndex]}
          posts={posts}
          selectedIndex={selectedPostIndex}
          setSelectedIndex={setSelectedPostIndex}
        />
      )}
    </div>
  )
}

export default ProfilePage
