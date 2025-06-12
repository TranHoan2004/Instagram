import { useRef, useState, useEffect } from 'react'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import SuggestionCardHorizontal from './SuggestionCardHorizontal'

interface User {
  id: string
  avatar: string
  username: string
  subtitle: string
}

interface SuggestionsCarouselProps {
  users?: User[]
  onUserFollow?: (userId: string) => void
  onUserDismiss?: (userId: string) => void
  className?: string
}

const SuggestionsCarousel = ({
  users,
  onUserFollow,
  onUserDismiss,
  className = ''
}: SuggestionsCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const isMounted = useRef(true)

  const defaultUsers: User[] = users || [
    {
      id: '1',
      avatar: 'https://i.pravatar.cc/150?img=1',
      username: 'Kirti Chadha',
      subtitle: 'Follows you'
    },
    {
      id: '2',
      avatar: 'https://i.pravatar.cc/150?img=2',
      username: 'Durgesh Nandini',
      subtitle: 'Followed by chirag_sir'
    },
    {
      id: '3',
      avatar: 'https://i.pravatar.cc/150?img=3',
      username: 'Rahul Kumar',
      subtitle: 'Follows you'
    },
    {
      id: '4',
      avatar: 'https://i.pravatar.cc/150?img=4',
      username: 'Priya Singh',
      subtitle: 'Followed by chirag_sir'
    }
  ]

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      return {
        canScrollLeft: scrollLeft > 10,
        canScrollRight: scrollLeft < scrollWidth - clientWidth - 10
      }
    }
    return { canScrollLeft: false, canScrollRight: true }
  }

  useEffect(() => {
    const updateScrollState = () => {
      if (!isMounted.current) return
      const scrollState = checkScrollability()

      if (scrollState.canScrollLeft !== canScrollLeft) {
        setCanScrollLeft(scrollState.canScrollLeft)
      }
      if (scrollState.canScrollRight !== canScrollRight) {
        setCanScrollRight(scrollState.canScrollRight)
      }
    }

    // Initial check after mount
    const timeout = setTimeout(updateScrollState, 0)

    return () => {
      isMounted.current = false
      clearTimeout(timeout)
    }
  }, [])

  const updateScrollState = () => {
    if (!isMounted.current) return
    const scrollState = checkScrollability()

    if (scrollState.canScrollLeft !== canScrollLeft) {
      setCanScrollLeft(scrollState.canScrollLeft)
    }
    if (scrollState.canScrollRight !== canScrollRight) {
      setCanScrollRight(scrollState.canScrollRight)
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' })
      setTimeout(updateScrollState, 300)
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' })
      setTimeout(updateScrollState, 300)
    }
  }

  const handleFollow = (userId: string) => {
    console.log('Follow user:', userId)
    onUserFollow?.(userId)
  }

  const handleDismiss = (userId: string) => {
    console.log('Dismiss user:', userId)
    onUserDismiss?.(userId)
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        onScroll={updateScrollState}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {defaultUsers.map((user) => (
          <SuggestionCardHorizontal
            key={user.id}
            avatar={user.avatar}
            username={user.username}
            subtitle={user.subtitle}
            onFollow={() => handleFollow(user.id)}
            onDismiss={() => handleDismiss(user.id)}
          />
        ))}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
          aria-label="See previous"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={scrollRight}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
          aria-label="See more"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export default SuggestionsCarousel
