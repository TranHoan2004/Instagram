import { Button } from '@heroui/react'

interface TabButtonProps {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}

const TabButton = ({ isActive, onClick, children }: TabButtonProps) => (
  <Button
    variant="light"
    size="sm"
    className={`font-semibold px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'text-black dark:text-white'
        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
    }`}
    onPress={onClick}
  >
    {children}
  </Button>
)

export default TabButton 