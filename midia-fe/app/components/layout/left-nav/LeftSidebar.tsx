import { useState } from 'react'
import {
  EllipsisHorizontalIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  EllipsisHorizontalIcon as EllipsisHorizontalIconSolid
} from '@heroicons/react/24/solid'
import NavigationItem from '../../ui/NavigationItem'
import CreatePostModal from './CreatePostModal'

const LeftSidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const navigationItems = [
    {
      icon: <HomeIcon className="size-6 min-w-[1.5rem]" />,
      activeIcon: <HomeIconSolid className="size-6 min-w-[1.5rem]" />,
      label: 'Home',
      path: '/'
    },
    {
      icon: <MagnifyingGlassIcon className="size-6 min-w-[1.5rem]" />,
      activeIcon: (
        <MagnifyingGlassIconSolid className="size-6 min-w-[1.5rem]" />
      ),
      label: 'Explore',
      path: '/explore'
    },
    {
      icon: <PlusCircleIcon className="size-6 min-w-[1.5rem]" />,
      activeIcon: <PlusCircleIconSolid className="size-6 min-w-[1.5rem]" />,
      label: 'Create',
      onClick: () => setIsModalOpen(true)
    },
    {
      icon: (
        <EllipsisHorizontalIcon className="size-6 min-w-[1.5rem] stroke-2" />
      ),
      activeIcon: (
        <EllipsisHorizontalIconSolid className="size-6 min-w-[1.5rem] stroke-2" />
      ),
      label: 'More',
      path: '/#'
    }
  ]

  return (
    <>
      <aside className="sticky top-[60px] left-0 h-screen w-16 md:w-[clamp(180px,calc(180px+((100vw-1600px)*0.46875)),300px)] bg-neutral-100 dark:bg-neutral-900 py-6 overflow-y-auto">

        <nav className="flex flex-col">
          <ul className="flex flex-col gap-4">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <NavigationItem
                  icon={item.icon}
                  activeIcon={item.activeIcon}
                  label={item.label}
                  path={item.path || ''}
                  onClick={item.onClick}
                />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default LeftSidebar
