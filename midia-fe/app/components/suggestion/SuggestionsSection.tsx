import SuggestionsCarousel from './SuggestionsCarousel'

interface User {
  id: string
  avatar: string
  username: string
  subtitle: string
}

interface SuggestionsSectionProps {
  title?: string
  users?: User[]
  onSeeAll?: () => void
  onUserFollow?: (userId: string) => void
  onUserDismiss?: (userId: string) => void
  className?: string
}

const SuggestionsSection = ({
  title = 'Suggestions for you',
  users,
  onSeeAll,
  onUserFollow,
  onUserDismiss,
  className = ''
}: SuggestionsSectionProps) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base text-[#737373] font-medium">{title}</h3>
        <button
          type="button"
          onClick={onSeeAll}
          className="text-xs font-semibold text-[#0095f6] hover:text-[#00376b] transition-colors"
        >
          See all
        </button>
      </div>

      <SuggestionsCarousel
        users={users}
        onUserFollow={onUserFollow}
        onUserDismiss={onUserDismiss}
      />
    </div>
  )
}

export default SuggestionsSection
