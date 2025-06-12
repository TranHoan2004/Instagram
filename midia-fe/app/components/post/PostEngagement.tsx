interface PostEngagementProps {
  likes: {
    count: number
    likedBy: string
    avatar: string
  }
  caption: {
    username: string
    text: string
  }
  className?: string
}

const PostEngagement = ({
  likes,
  caption,
  className = ''
}: PostEngagementProps) => {
  const formatLikesCount = (count: number) => {
    return count.toLocaleString()
  }

  return (
    <div className={`relative w-[440px] bg-transparent pt-3 ${className}`}>
      <div className="absolute left-0 top-3  h-[19px] flex items-center">
        <div className="flex items-center gap-1">
          <div className="w-[17px] h-[17px] rounded-full overflow-hidden flex-shrink-0">
            <img
              src={likes.avatar}
              alt={likes.likedBy}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-[13px] leading-[18px] text-[#262626]">
            <span className="font-normal">Liked by </span>
            <span className="font-semibold">{likes.likedBy}</span>
            <span className="font-normal"> and </span>
            <span className="font-semibold">
              {formatLikesCount(likes.count)} others
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center w-full h-9 mt-7">
        <div className="w-full">
          <div className="text-[14px] leading-[18px] text-[#262626]">
            <span className="font-bold">{caption.username}</span>
            <span className="font-medium"> </span>
            <span className="font-normal">{caption.text}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostEngagement
