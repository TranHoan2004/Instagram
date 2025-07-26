import { BookmarkIcon, PhotoIcon, TagIcon } from '@heroicons/react/24/outline'
import {
  BookmarkIcon as BookmarkIconSolid,
  PhotoIcon as PhotoIconSolid,
  TagIcon as TagIconSolid
} from '@heroicons/react/24/solid'
import { NavLink, useLocation } from 'react-router'

type TabType = 'posts' | 'saved' | 'tagged'

export const tabs: {
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

const ProfileTabs = () => {
  const location = useLocation()

  const getActiveTab = (): TabType => {
    const subpath = location.pathname.replace(/\/profile\/?/, '')
    if (!subpath || subpath === '/') return 'posts'
    const firstSegment = subpath.split('/')[0]
    if (firstSegment === 'saved') return 'saved'
    if (firstSegment === 'tagged') return 'tagged'
    return 'posts'
  }

  const activeTab = getActiveTab()

  return (
    <div className="max-w-4xl w-full mx-auto px-4">
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
    </div>
  )
}

export default ProfileTabs
