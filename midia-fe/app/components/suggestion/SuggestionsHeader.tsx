interface SuggestionsHeaderProps {
  title?: string
  onSeeAllClick?: () => void
  className?: string
}

const SuggestionsHeader = ({
  title = 'Suggestions for you',
  onSeeAllClick,
  className = ''
}: SuggestionsHeaderProps) => {
  return (
    <div
      className={`flex items-center justify-between w-full h-[18px] px-0 py-0 bg-transparent ${className}`}
    >
      {/* Title Text */}
      <div className="w-[126px] h-[18px] flex items-center">
        <span
          className="text-[#8e8e8e] font-roboto font-semibold text-[14px] leading-[18px] text-left"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {title}
        </span>
      </div>

      {/* See All Link */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onSeeAllClick}
          className="text-[#0095f6] font-roboto font-semibold text-[13px] leading-[18px] text-right hover:opacity-80 transition-opacity"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          See all
        </button>
      </div>
    </div>
  )
}

export default SuggestionsHeader
