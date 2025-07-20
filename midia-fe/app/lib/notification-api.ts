import { gql, useQuery, useMutation, useSubscription } from '@apollo/client/index.js'
import type {
  NotificationsQueryResponse,
  UnreadNotificationCountResponse,
  MarkNotificationAsReadResponse,
  MarkAllNotificationsAsReadResponse,
  CreateFollowNotificationResponse,
  CreateLikeNotificationResponse,
  CreateCommentNotificationResponse,
  CreateMentionNotificationResponse,
  NotificationUpdatesSubscription,
  Notification
} from './graphql-types'

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
  mutation MarkNotificationAsRead($id: String!) {
    markNotificationAsRead(id: $id)
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
  mutation CreateLikeNotification($actorId: String!, $recipientId: String!, $postId: String!) {
    createLikeNotification(actorId: $actorId, recipientId: $recipientId, postId: $postId)
  }
`

export const CREATE_COMMENT_NOTIFICATION = gql`
  mutation CreateCommentNotification($actorId: String!, $recipientId: String!, $postId: String!) {
    createCommentNotification(actorId: $actorId, recipientId: $recipientId, postId: $postId)
  }
`

export const CREATE_MENTION_NOTIFICATION = gql`
  mutation CreateMentionNotification($actorId: String!, $recipientId: String!, $postId: String!) {
    createMentionNotification(actorId: $actorId, recipientId: $recipientId, postId: $postId)
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

// Custom Hooks
export const useNotifications = () => {
  return useQuery<NotificationsQueryResponse>(GET_NOTIFICATIONS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000, // Poll every 30 seconds for updates
    context: { requiresAuth: true },
    onError: (error) => {
      console.error('Notifications query error:', error)
      console.error('Network error:', error.networkError)
      console.error('GraphQL errors:', error.graphQLErrors)
      if (error.networkError) {
        console.error('Network error status:', error.networkError)
      }
      if (error.graphQLErrors?.length > 0) {
        error.graphQLErrors.forEach((gqlError) => {
          console.error('GraphQL error extensions:', gqlError.extensions)
          console.error('GraphQL error classification:', gqlError.extensions?.classification)
        })
      }
    }
  })
}

export const useUnreadNotificationCount = () => {
  return useQuery<UnreadNotificationCountResponse>(GET_UNREAD_NOTIFICATION_COUNT, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    pollInterval: 15000, // Poll every 15 seconds
    context: { requiresAuth: true },
    onError: (error) => {
      console.error('Unread count query error:', error)
      console.error('Network error:', error.networkError)
      console.error('GraphQL errors:', error.graphQLErrors)
    }
  })
}

export const useMarkNotificationAsRead = () => {
  return useMutation<MarkNotificationAsReadResponse, { id: string }>(
    MARK_NOTIFICATION_AS_READ,
    {
      refetchQueries: [GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT],
      awaitRefetchQueries: true,
      context: { requiresAuth: true },
    }
  )
}

export const useMarkAllNotificationsAsRead = () => {
  return useMutation<MarkAllNotificationsAsReadResponse>(
    MARK_ALL_NOTIFICATIONS_AS_READ,
    {
      refetchQueries: [GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT],
      awaitRefetchQueries: true,
      context: { requiresAuth: true },
    }
  )
}

export const useCreateFollowNotification = () => {
  return useMutation<CreateFollowNotificationResponse, { actorId: string; recipientId: string }>(
    CREATE_FOLLOW_NOTIFICATION,
    {
      context: { requiresAuth: true },
    }
  )
}

export const useCreateLikeNotification = () => {
  return useMutation<CreateLikeNotificationResponse, { actorId: string; recipientId: string; postId: string }>(
    CREATE_LIKE_NOTIFICATION,
    {
      context: { requiresAuth: true },
    }
  )
}

export const useCreateCommentNotification = () => {
  return useMutation<CreateCommentNotificationResponse, { actorId: string; recipientId: string; postId: string }>(
    CREATE_COMMENT_NOTIFICATION,
    {
      context: { requiresAuth: true },
    }
  )
}

export const useCreateMentionNotification = () => {
  return useMutation<CreateMentionNotificationResponse, { actorId: string; recipientId: string; postId: string }>(
    CREATE_MENTION_NOTIFICATION,
    {
      context: { requiresAuth: true },
    }
  )
}

export const useNotificationUpdates = () => {
  return useSubscription<NotificationUpdatesSubscription>(NOTIFICATION_UPDATES_SUBSCRIPTION, {
    errorPolicy: 'all',
    context: { requiresAuth: true },
  })
}

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