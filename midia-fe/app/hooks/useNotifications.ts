import { useMutation, useQuery, useSubscription } from '@apollo/client/index.js'
import type {
  CreateCommentNotificationResponse,
  CreateFollowNotificationResponse,
  CreateLikeNotificationResponse,
  CreateMentionNotificationResponse,
  MarkAllNotificationsAsReadResponse,
  MarkNotificationAsReadResponse,
  NotificationsQueryResponse,
  NotificationUpdatesSubscription,
  UnreadNotificationCountResponse
} from '~/lib/graphql-types'
import {
  CREATE_COMMENT_NOTIFICATION,
  CREATE_FOLLOW_NOTIFICATION,
  CREATE_LIKE_NOTIFICATION,
  CREATE_MENTION_NOTIFICATION,
  GET_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  MARK_NOTIFICATION_AS_READ,
  NOTIFICATION_UPDATES_SUBSCRIPTION
} from '~/lib/notification-api'

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
          console.error(
            'GraphQL error classification:',
            gqlError.extensions?.classification
          )
        })
      }
    }
  })
}

export const useUnreadNotificationCount = () => {
  return useQuery<UnreadNotificationCountResponse>(
    GET_UNREAD_NOTIFICATION_COUNT,
    {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
      pollInterval: 15000, // Poll every 15 seconds
      context: { requiresAuth: true },
      onError: (error) => {
        console.error('Unread count query error:', error)
        console.error('Network error:', error.networkError)
        console.error('GraphQL errors:', error.graphQLErrors)
      }
    }
  )
}

export const useMarkNotificationAsRead = () => {
  return useMutation<
    MarkNotificationAsReadResponse,
    { notificationId: string }
  >(MARK_NOTIFICATION_AS_READ, {
    refetchQueries: [GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT],
    awaitRefetchQueries: true,
    context: { requiresAuth: true }
  })
}

export const useMarkAllNotificationsAsRead = () => {
  return useMutation<MarkAllNotificationsAsReadResponse>(
    MARK_ALL_NOTIFICATIONS_AS_READ,
    {
      refetchQueries: [GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT],
      awaitRefetchQueries: true,
      context: { requiresAuth: true }
    }
  )
}

export const useCreateFollowNotification = () => {
  return useMutation<
    CreateFollowNotificationResponse,
    { actorId: string; recipientId: string }
  >(CREATE_FOLLOW_NOTIFICATION, {
    context: { requiresAuth: true }
  })
}

export const useCreateLikeNotification = () => {
  return useMutation<
    CreateLikeNotificationResponse,
    { actorId: string; recipientId: string; postId: string }
  >(CREATE_LIKE_NOTIFICATION, {
    context: { requiresAuth: true }
  })
}

export const useCreateCommentNotification = () => {
  return useMutation<
    CreateCommentNotificationResponse,
    { actorId: string; recipientId: string; postId: string }
  >(CREATE_COMMENT_NOTIFICATION, {
    context: { requiresAuth: true }
  })
}

export const useCreateMentionNotification = () => {
  return useMutation<
    CreateMentionNotificationResponse,
    { actorId: string; recipientId: string; postId: string }
  >(CREATE_MENTION_NOTIFICATION, {
    context: { requiresAuth: true }
  })
}

export const useNotificationUpdates = () => {
  return useSubscription<NotificationUpdatesSubscription>(
    NOTIFICATION_UPDATES_SUBSCRIPTION,
    {
      errorPolicy: 'all',
      context: { requiresAuth: true }
    }
  )
}
