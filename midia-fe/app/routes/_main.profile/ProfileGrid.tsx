import type { Post } from '~/lib/types'
import ProfileThumbnail from './ProfileThumbnail'

interface ProfileGridProps {
  posts: Post[]
  onPostClick: (post: Post, idx: number) => void
}

const ProfileGrid = ({ posts, onPostClick }: ProfileGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-0.5 md:gap-1">
      {posts.map((post, idx) => (
        <ProfileThumbnail
          key={post.id}
          src={Array.isArray(post.image) ? post.image[0] : post.image}
          alt={post.caption}
          likes={post.likes}
          comments={post.comments.length}
          onClick={() => onPostClick(post, idx)}
        />
      ))}
    </div>
  )
}

export default ProfileGrid