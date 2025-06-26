import { addToast } from '@heroui/react'
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import type { NotificationType as BackendNotificationType, Notification } from '~/lib/graphql-types'
import {
  formatNotificationTime,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useNotificationUpdates,
  useUnreadNotificationCount
} from '~/lib/notification-api'
import type { ApolloError, ApolloQueryResult } from '@apollo/client'

export interface NotificationType extends Omit<Notification, 'type'> {
  time?: string
  type: BackendNotificationType | 'follow' | 'like' | 'suggestion'
}

export interface NotificationBatch {
  yesterday: NotificationType[]
  thisWeek: NotificationType[]
  earlier: NotificationType[]
}

interface NotificationsQueryResponse {
  notifications: NotificationBatch
}

interface NotificationContextType {
  notifications: NotificationBatch
  unreadCount: number
  loading: boolean
  error: ApolloError | undefined
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refetch: () => Promise<ApolloQueryResult<NotificationsQueryResponse>>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [localNotifications, setLocalNotifications] = useState<NotificationBatch>({
    yesterday: [],
    thisWeek: [],
    earlier: []
  })

  const { data: notificationsData, loading: notificationsLoading, error: notificationsError, refetch } = useNotifications()
  const { data: unreadCountData, loading: unreadCountLoading, error: unreadCountError } = useUnreadNotificationCount()
  const [markAsReadMutation] = useMarkNotificationAsRead()
  const [markAllAsReadMutation] = useMarkAllNotificationsAsRead()
  
  const { data: subscriptionData, error: subscriptionError } = useNotificationUpdates()

  const combinedError = notificationsError || unreadCountError || subscriptionError

  const processNotifications = useCallback((notifications: Notification[]): NotificationType[] => {
    return notifications.map(notification => ({
      ...notification,
      time: formatNotificationTime(notification.createdAt)
    }))
  }, [])

  useEffect(() => {
    if (notificationsData?.notifications) {
      setLocalNotifications({
        yesterday: processNotifications(notificationsData.notifications.yesterday || []),
        thisWeek: processNotifications(notificationsData.notifications.thisWeek || []),
        earlier: processNotifications(notificationsData.notifications.earlier || [])
      })
    } else if (notificationsError) {
      console.error('Notifications error:', notificationsError)
      setLocalNotifications({
        yesterday: [],
        thisWeek: [],
        earlier: []
      })
    }
  }, [notificationsData, notificationsError, processNotifications])

  useEffect(() => {
    if (subscriptionData?.notificationUpdates) {
      const newNotification = subscriptionData.notificationUpdates
      
      addToast({
        title: 'New Notification',
        description: `${newNotification.actor.username} ${newNotification.message}`,
        color: 'primary'
      })

      refetch()
    }
  }, [subscriptionData, refetch])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markAsReadMutation({ variables: { id } })
      
      // Optimistically update local state
      setLocalNotifications(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(section => {
          updated[section as keyof NotificationBatch] = updated[section as keyof NotificationBatch].map(notification => 
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        })
        return updated
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      addToast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        color: 'danger'
      })
      throw error
    }
  }, [markAsReadMutation])

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation()
      
      // Optimistically update local state
      setLocalNotifications(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(section => {
          updated[section as keyof NotificationBatch] = updated[section as keyof NotificationBatch].map(notification => ({
            ...notification,
            isRead: true
          }))
        })
        return updated
      })

      addToast({
        title: 'Success',
        description: 'All notifications marked as read',
        color: 'success'
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      addToast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        color: 'danger'
      })
      throw error
    }
  }, [markAllAsReadMutation])

  const contextValue = useMemo(() => ({
    notifications: localNotifications,
    unreadCount: unreadCountData?.unreadNotificationCount || 0,
    loading: notificationsLoading || unreadCountLoading,
    error: combinedError,
    markAsRead,
    markAllAsRead,
    refetch
  }), [
    localNotifications,
    unreadCountData?.unreadNotificationCount,
    notificationsLoading,
    unreadCountLoading,
    combinedError,
    markAsRead,
    markAllAsRead,
    refetch
  ])

  return (
    <NotificationContext value={contextValue}>
      {children}
    </NotificationContext>
  )
}

export const useNotificationContext = () => {
  const context = use(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
} 