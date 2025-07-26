import type { Post } from '~/lib/graphql-types'
import ProfileThumbnail from './ProfileThumbnail'
import { PhotoIcon, BookmarkIcon, TagIcon } from '@heroicons/react/24/outline'
import type { UseInfiniteScrollHookRootRefCallback } from 'react-infinite-scroll-hook'

interface ProfileGridProps {
  ref?: UseInfiniteScrollHookRootRefCallback
  posts: Post[]
  onPostClick: (post: Post, idx: number) => void
  message?: string // Thông báo tuỳ chỉnh cho saved/tagged
}

const getMessageIcon = (message?: string) => {
  const iconClass = 'w-12 h-12 text-gray-300 dark:text-gray-600'
  if (message === 'No saved posts') {
    // Bookmark icon
    return <BookmarkIcon className={iconClass} strokeWidth={1.5} />
  }
  if (message === 'No tagged yet') {
    // Tag icon
    return <TagIcon className={iconClass} strokeWidth={1.5} />
  }
  // Default: No posts yet (Photo icon)
  return <PhotoIcon className={iconClass} strokeWidth={1.5} />
}

const ProfileGrid = ({
  posts,
  onPostClick,
  message,
  ref
}: ProfileGridProps) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 w-full">
        <div className="rounded-full border-2 border-gray-300 dark:border-gray-600 w-20 h-20 flex items-center justify-center mb-4 bg-white dark:bg-neutral-900">
          {getMessageIcon(message)}
        </div>
        <div className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          {message || 'No posts yet'}
        </div>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 md:gap-1" ref={ref}>
      {posts
        .filter(Boolean)
        .map(
          (post, idx) =>
            post && (
              <ProfileThumbnail
                key={post.id}
                src={post?.attachments?.[0]?.originalLink || ''}
                alt={post.caption || ''}
                likes={post?.totalLikes}
                comments={post?.totalComments}
                attachments={post.attachments}
                onClick={() => onPostClick(post, idx)}
              />
            )
        )}
    </div>
  )
}

export default ProfileGrid
