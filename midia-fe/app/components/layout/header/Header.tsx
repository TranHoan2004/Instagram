import NotificationDropdown from '~/routes/_main.notifications/elements/NotificationDropdown'
import BrandLogo from '~/components/ui/BrandLogo'
import SearchBar from '~/components/ui/SearchBar'
import ThemeSwitcher from './ThemeSwitcher'

const LayoutHeader = () => {
  return (
    <header
      className="fixed bg-white dark:bg-black top-0 left-0 right-0 z-50 flex items-center justify-between w-screen h-[60px] px-7"
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

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        <ThemeSwitcher />
      </div>
    </header>
  )
}

export default LayoutHeader
