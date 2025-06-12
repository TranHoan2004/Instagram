export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface Post {
  user: {
    avatar: string
    username: string
    isVerified: boolean
    subtitle?: string
    isFollowing?: boolean
  }
  id: string
  timestamp: string
  image: string | string[]
  likes: number
  caption: string
  comments: Comment[]
  likedBy?: {
    username: string
    avatar: string
  }
}

export interface Comment {
  id?: string
  username: string
  content: string
  mentions?: string[]
  timestamp?: string
  likes?: number
  isLiked?: boolean
}

export interface AvatarProps {
  avatar: string
  username: string
  subtitle?: string
  isFollowing?: boolean
  onActionClick?: () => void
  className?: string
}