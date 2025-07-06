import SuggestedUsersList from '~/components/suggestion/SuggestedUsersList'
import { useAuth } from '~/contexts/AuthContext'
import { Avatar } from '@heroui/react'

const RightSidebar = () => {
  const { user } = useAuth()

  const handleSwitch = () => {}

  return (
    <aside className="sticky right-0 top-[60px] h-[calc(100vh-60px)] w-80 md:translate-x-0 translate-x-full hidden lg:flex flex-col">
      <div className="flex items-center justify-between w-full px-5 pt-5">
        <div className="flex items-center gap-3">
          <Avatar src={user?.profile?.avatarUrl} alt={user?.username} />

          <div className="flex flex-col gap-0.5">
            <span className="text-base font-medium leading-4">
              {user?.username}
            </span>
            <span className="text-sm font-normal opacity-60">
              {user?.profile?.fullName}
            </span>
          </div>
        </div>

        <span
          onClick={handleSwitch}
          className="text-xs font-semibold leading-4 hover:opacity-80 transition-opacity cursor-pointer"
        >
          Switch
        </span>
      </div>
      <SuggestedUsersList />
    </aside>
  )
}

export default RightSidebar
