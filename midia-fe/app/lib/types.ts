export interface Comment {
  id?: string
  username: string
  content: string
  mentions?: string[]
  timestamp?: string
  likes?: number
  isLiked: boolean
}

export interface AvatarProps {
  avatar: string
  username: string
  subtitle?: string
  isFollowing?: boolean
  onActionClick?: () => void
  className?: string
}

export interface UploadResult {
  attachmentId: string
  file: File
}

//Create post
export interface CreatePostData {
  caption?: string
  visibility?: string
  attachmentIds?: string[]
  taggedUsers?: Array<{ username: string; x: number; y: number }>
}
