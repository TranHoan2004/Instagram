import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@heroui/react'

interface SuggestionCardHorizontalProps {
  avatar: string
  username: string
  subtitle: string
  onFollow: () => void
  onDismiss: () => void
}

const SuggestionCardHorizontal = ({
  avatar,
  username,
  subtitle,
  onFollow,
  onDismiss
}: SuggestionCardHorizontalProps) => {
  return (
    <div className="relative flex-shrink-0 w-40 rounded-lg p-3">
      <span
        onClick={onDismiss}
        className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center cursor-pointer"
      >
        <XMarkIcon className="w-4 h-4" />
      </span>

      <div className="flex justify-center">
        <div className="w-15 h-15 rounded-full overflow-hidden">
          <img
            src={avatar}
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="mt-2 text-center">
        <h4 className="text-sm font-medium truncate">{username}</h4>
        <p className="text-xs mt-1 truncate">{subtitle}</p>
      </div>

      <div className="mt-3">
        <Button
          type="button"
          color="primary"
          onPress={onFollow}
          className="w-full text-sm font-semibold"
        >
          Follow
        </Button>
      </div>
    </div>
  )
}

export default SuggestionCardHorizontal
