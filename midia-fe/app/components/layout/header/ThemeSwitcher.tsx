import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@heroui/react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { cn } from '~/lib/utils'

const ThemeSwitcher = ({ className }: { className?: string }) => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () =>
    theme === 'light' ? setTheme('dark') : setTheme('light')

  if (!mounted) return <Button isIconOnly isDisabled radius="full"></Button>

  return (
    <Button
      isIconOnly
      variant="bordered"
      radius="full"
      className={cn('border border-foreground-400', className)}
      onPress={toggleTheme}
    >
      {theme === 'light' ? (
        <MoonIcon className="size-6 text-gray-800" />
      ) : (
        <SunIcon className="size-6 text-gray-300" />
      )}
    </Button>
  )
}

export default ThemeSwitcher
