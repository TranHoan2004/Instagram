import ProfileThumbnail from './ProfileThumbnail'

interface ProfileGridProps {
  posts: { id: string; imageUrl: string; altText: string }[]
}

const ProfileGrid = ({ posts }: ProfileGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-0.5 md:gap-1">
      {posts.map((post) => (
        <ProfileThumbnail
          key={post.id}
          src={post.imageUrl}
          alt={post.altText}
        />
      ))}
    </div>
  )
}

export default ProfileGrid
