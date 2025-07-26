import { gql } from '@apollo/client/index.js'
import type { Notification } from './graphql-types'

// GraphQL Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      yesterday {
        id
        type
        message
        isRead
        createdAt
        actor {
          id
          username
          profile {
            avatarUrl
            fullName
          }
        }
        post {
          id
          caption
          attachments {
            id
            optimizedLinks
          }
        }
      }
      thisWeek {
        id
        type
        message
        isRead
        createdAt
        actor {
          id
          username
          profile {
            avatarUrl
            fullName
          }
        }
        post {
          id
          caption
          attachments {
            id
            optimizedLinks
          }
        }
      }
      earlier {
        id
        type
        message
        isRead
        createdAt
        actor {
          id
          username
          profile {
            avatarUrl
            fullName
          }
        }
        post {
          id
          caption
          attachments {
            id
            optimizedLinks
          }
        }
      }
    }
  }
`

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`

// GraphQL Mutations
export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(notificationId: $notificationId)
  }
`

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`

export const CREATE_FOLLOW_NOTIFICATION = gql`
  mutation CreateFollowNotification($actorId: String!, $recipientId: String!) {
    createFollowNotification(actorId: $actorId, recipientId: $recipientId)
  }
`

export const CREATE_LIKE_NOTIFICATION = gql`
  mutation CreateLikeNotification(
    $actorId: String!
    $recipientId: String!
    $postId: String!
  ) {
    createLikeNotification(
      actorId: $actorId
      recipientId: $recipientId
      postId: $postId
    )
  }
`

export const CREATE_COMMENT_NOTIFICATION = gql`
  mutation CreateCommentNotification(
    $actorId: String!
    $recipientId: String!
    $postId: String!
  ) {
    createCommentNotification(
      actorId: $actorId
      recipientId: $recipientId
      postId: $postId
    )
  }
`

export const CREATE_MENTION_NOTIFICATION = gql`
  mutation CreateMentionNotification(
    $actorId: String!
    $recipientId: String!
    $postId: String!
  ) {
    createMentionNotification(
      actorId: $actorId
      recipientId: $recipientId
      postId: $postId
    )
  }
`

// GraphQL Subscriptions
export const NOTIFICATION_UPDATES_SUBSCRIPTION = gql`
  subscription NotificationUpdates {
    notificationUpdates {
      id
      type
      message
      isRead
      createdAt
      actor {
        id
        username
        profile {
          avatarUrl
          fullName
        }
      }
      post {
        id
        caption
        attachments {
          id
          optimizedLinks
        }
      }
    }
  }
`

// Utility functions
export const formatNotificationTime = (createdAt: string): string => {
  const now = new Date()
  const notificationTime = new Date(createdAt)
  const diffInMs = now.getTime() - notificationTime.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m`
  } else if (diffInHours < 24) {
    return `${diffInHours}h`
  } else if (diffInDays < 7) {
    return `${diffInDays}d`
  } else {
    return `${diffInWeeks}w`
  }
}

export const getNotificationMessage = (notification: Notification): string => {
  const { type, message, actor } = notification
  const actorName = actor.profile?.fullName || actor.username

  switch (type) {
    case 'FOLLOW':
      return `${actorName} started following you.`
    case 'LIKE':
      return `${actorName} liked your post.`
    case 'COMMENT':
      return `${actorName} commented on your post.`
    case 'MENTION':
      return `${actorName} mentioned you in a post.`
    default:
      return message
  }
}

export const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'FOLLOW':
      return '👤'
    case 'LIKE':
      return '❤️'
    case 'COMMENT':
      return '💬'
    case 'MENTION':
      return '📢'
    default:
      return '🔔'
  }
}
