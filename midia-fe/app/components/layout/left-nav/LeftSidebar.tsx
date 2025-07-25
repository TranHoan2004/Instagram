import { useState } from 'react'
import {
  HomeIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  ChatBubbleLeftIcon,
  FireIcon,
  PhotoIcon,
  Bars3Icon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
  FireIcon as FireIconSolid,
  PhotoIcon as PhotoIconSolid,
} from '@heroicons/react/24/solid'
import NavigationItem from '../../ui/NavigationItem'
import CreatePostModal from '~/routes/_main.create-post/CreatePostModal'
import { Avatar } from '@heroui/react'
import { useAuth } from '~/contexts/AuthContext'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react'

const LeftSidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, signOut } = useAuth()

  const navigationItems = [
    {
      icon: <HomeIcon className="size-6 min-w-[1.5rem]" />,
      activeIcon: <HomeIconSolid className="size-6 min-w-[1.5rem]" />,
      label: 'Home',
      path: '/'
    },
    {
      icon: <PlusCircleIcon className="size-6 min-w-[1.5rem]" />,
      label: 'Create',
      onClick: () => setIsModalOpen(true)
    },
    {
      icon: <FireIcon className="size-6 min-w-[1.5rem]" />,
      activeIcon: <FireIconSolid className="size-6 min-w-[1.5rem]" />,
      label: 'Explore',
      path: '/explore/posts'
    },
    {
      icon: <ChatBubbleLeftIcon className="size-6 min-w-[1.5rem]" />,
      activeIcon: <ChatBubbleLeftIconSolid className="size-6 min-w-[1.5rem]" />,
      label: 'Messages',
      path: '/messages'
    },
    {
      icon: <PhotoIcon className="size-6 min-w-[1.5rem]" />,
      activeIcon: <PhotoIconSolid className="size-6 min-w-[1.5rem]" />,
      label: 'Activities',
      path: '/your-activity'
    },

    {
      icon: (
        <Avatar
          className="size-6 min-w-[1.5rem]"
          src={user?.profile?.avatarUrl || ''}
        />
      ),
      activeIcon: (
        <Avatar
          className="size-6 min-w-[1.5rem]"
          src={user?.profile?.avatarUrl || ''}
        />
      ),
      label: 'Profile',
      path: '/profile'
    }
  ]

  const bottomNavigationItems = [
    {
      icon: <Cog6ToothIcon className="size-6 min-w-[1.5rem]" />,
      activeIcon: <Cog6ToothIconSolid className="size-6 min-w-[1.5rem]" />,
      label: 'Setting',
      path: '/setting'
    }
  ]

  return (
    <>
      <aside className="sticky top-[60px] left-0 h-[calc(100vh-60px)] w-16 md:w-[clamp(180px,calc(180px+((100vw-1600px)*0.46875)),300px)] py-6 overflow-y-auto">
        <nav className="flex flex-col h-full">
          <ul className="flex flex-col gap-4 flex-grow">
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
          <ul className="flex flex-col gap-4 pt-4">
            {bottomNavigationItems.map((item) => (
              <li key={item.label}>
                <NavigationItem
                  icon={item.icon}
                  activeIcon={item.activeIcon}
                  label={item.label}
                  path={item.path || ''}
                />
              </li>
            ))}
            <li key="More">
              <Dropdown placement="right-start">
                <DropdownTrigger>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center justify-center md:justify-start gap-4 w-full md:px-4 py-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Bars3Icon className="size-6 min-w-[1.5rem] stroke-2" />
                    <span className="hidden md:inline">More</span>
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="More menu">
                  <DropdownItem key="logout" color="danger" onPress={signOut} startContent={<ArrowLeftOnRectangleIcon className="size-5" />}>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </li>
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
