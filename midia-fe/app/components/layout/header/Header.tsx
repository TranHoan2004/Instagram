import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@heroui/react'
import { BellIcon } from '@heroicons/react/24/outline'
import ThemeSwitcher from './ThemeSwitcher'
import { useNavigate } from 'react-router'
import SearchBar from '~/components/ui/SearchBar'
import BrandLogo from '~/components/ui/BrandLogo'

const LayoutHeader = () => {
  const navigate = useNavigate()

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-between w-screen h-[60px] px-7 border-neutral-300 dark:border-neutral-600"
      role="banner"
    >
      <div className="flex items-center gap-10">
        {/* Logo */}
        <BrandLogo />


      </div>

      {/* Right Side: Theme Switcher, Notifications, User Menu */}
      <div className="flex items-center gap-6">
                {/* Search Bar */}
        <div className="flex-grow max-w-lg">
          <SearchBar />
        </div>
        <ThemeSwitcher />

        {/* Notifications Dropdown */}
        <Dropdown shouldCloseOnScroll={true}>
          <DropdownTrigger>
            <Button
              isIconOnly
              aria-label="Notifications"
              variant="bordered"
              radius="full"
              className="border border-foreground-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <BellIcon className="size-6 text-gray-400" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disabledKeys={['NotificationLabel']}
            aria-label="Notifications"
          >
            <DropdownSection aria-label="Notifications">
              <DropdownItem
                key="NotificationLabel"
                isReadOnly
                className="opacity-100"
                as="div"
              >
                <h1 className="text-lg font-bold">Notifications</h1>
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>

        {/* User Avatar Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              type="button"
              className="cursor-pointer transition-transform hover:bg-neutral-100 dark:hover:bg-neutral-700 p-1 rounded-full"
              src="https://i.pravatar.cc/150?img=1"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Your Account">
            <DropdownItem key="profile" onClick={handleProfileClick}>
              Profile
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}

export default LayoutHeader
