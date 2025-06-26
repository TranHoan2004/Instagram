import { useLocation, useNavigate } from 'react-router'
import { cn } from '~/lib/utils'

interface NavigationItemProps {
  icon: React.ReactNode
  activeIcon: React.ReactNode
  label: string
  path: string
  onClick?: () => void
}

const NavigationItem = ({
  icon,
  activeIcon,
  label,
  path,
  onClick
}: NavigationItemProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = location.pathname === path

  const handleClick = () => {
    navigate(path)
  }

  return (
    <button
      onClick={onClick || handleClick}
      className={cn(
        'flex cursor-pointer items-center justify-center md:justify-start gap-4 w-full md:px-4 py-3 rounded-lg '
      )}
      type="button"
    >
      {isActive ? activeIcon : icon}
      <span className={`${isActive ? 'font-semibold' : 'font-normal'} text-md hidden md:inline`}>{label}</span>
    </button>
  )
}

export default NavigationItem
