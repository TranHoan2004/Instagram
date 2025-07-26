export interface Connection<T> {
  edges: {
    cursor: string
    node: T
  }[]

  pageInfo: {
    hasPreviousPage: boolean
    hasNextPage: boolean
    startCursor?: string
    endCursor?: string
  }
}

export interface RegisterUserInput {
  input: {
    email: string
    password: string
    username: string
    firstName: string
    lastName?: string
    dob: string
  }
}

export enum Sort {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface RegisterUserResp {
  register: {
    id: string
    message: string
  }
}

// Notification types based on backend GraphQL schema
export enum NotificationType {
  FOLLOW = 'FOLLOW',
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  MENTION = 'MENTION'
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: string
  actor: User
  post?: Post | null
}

export interface NotificationBatch {
  yesterday: Notification[]
  thisWeek: Notification[]
  earlier: Notification[]
}

export interface User {
  id: string
  username: string
  role?: string
  profile?: UserProfile
  email?: string
  stats?: UserStats
  followers?: User[]
  followings?: User[]
  posts?: Post[]
}

export interface UserProfile {
  fullName: string
  phoneNumber?: string
  birthDate?: string
  bio?: string
  avatarUrl?: string
}

export interface UserStats {
  totalFollowings?: number
  totalFollowers?: number
  totalPosts?: number
}

export interface Attachment {
  id: string
  originalLink: string
  optimizedLinks: Record<string, string>
  createdAt?: string
  updatedAt?: string
}

//Post
export interface Post {
  id: string
  caption: string
  visibility: string
  createdAt: string
  updatedAt: string
  author?: User
  comments?: Comment[]
  attachments?: Attachment[]
  totalLikes: number
  totalComments: number
}

export interface CommentType {
  id: string
  content: string
  createdAt: string
  totalLikes: number 
  author: {
    id: string
    username: string
    profile?: {
        avatarUrl?: string | null
    }
  }
  isLiked: boolean 
}

export interface CreatePostInput {
  caption: string
  visibility: string
  attachmentIds?: string[]
}

export interface CommentInput {
  postId: string;
  parentId?: string | null; 
  content: string;
}

// Notification API responses
export interface NotificationsQueryResponse {
  notifications: NotificationBatch
}

export interface UnreadNotificationCountResponse {
  unreadNotificationCount: number
}

export interface MarkNotificationAsReadResponse {
  markNotificationAsRead: boolean
}

export interface MarkAllNotificationsAsReadResponse {
  markAllNotificationsAsRead: boolean
}

export interface CreateFollowNotificationResponse {
  createFollowNotification: boolean
}

export interface CreateLikeNotificationResponse {
  createLikeNotification: boolean
}

export interface CreateCommentNotificationResponse {
  createCommentNotification: boolean
}

export interface CreateMentionNotificationResponse {
  createMentionNotification: boolean
}

// Subscription types
export interface NotificationUpdatesSubscription {
  notificationUpdates: Notification
}

//Attachment

//User
export interface EditUserInput {
    userId: string
    avatarUrl: string
    fullName: string
    username: string
    bio: string
    email: string
    phoneNumber: string
}