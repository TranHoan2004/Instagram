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
}

export interface UserProfile {
  userID: string
  fullName: string
  phoneNumber?: string
  birthDate?: string
  bio?: string
  avatarUrl?: string
}

export interface UserStats {
  userID: string
  followingCount: number
  followerCount: number
  postCount: number
}

export interface Post {
  id: string
  caption?: string
  imageUrls?: string[]
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
